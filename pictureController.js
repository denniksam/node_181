
const formidable = require( "formidable" ) ;  // Form parser
const fs         = require( "fs" ) ;          // file system

const HTTP_PORT    = 80 ;
const WWW_ROOT     = "www" ;
const FILE_404     = WWW_ROOT + "/404.html" ;
const DEFAULT_MIME = "application/octet-stream" ;
const UPLOAD_PATH  = WWW_ROOT + "/pictures/"

module.exports = {
    analyze: function( request, response ) {
        const method = request.method.toUpperCase() ;
        switch( method ) {
            case 'GET'  :  // возврат списка картин
                doGet( request, response ) ;
                break ;
            case 'POST' :  // загрузка новой картины
                doPost( request, response ) ;
                break ;
            case 'DELETE' :  
                doDelete( request, response ) ;
                break ;
        }
    }
} ;

function doDelete( request, response ) {
    extractBody( request )
    .then( body => {
        // Валидация: id должен присутствовать и состоять только из цифр
        if ( ! body.id || ! /^\d+$/.test( body.id ) ) {  // NaN - 1.56, 1e-1
            response.errorHandlers.send500();
            return ;
        }
        response.setHeader( 'Content-Type', 'application/json' ) ;
        response.end( JSON.stringify( { "results": body.id } ) ) ;
    } ) ;
}

function doPost( request, response ) {
    // принять данные формы
    // ! отключить (если есть) наш обработчик событий data/end
    const formParser = formidable.IncomingForm() ;
    formParser.parse( 
        request, 
        (err, fields, files) => {
            if( err ) {
                console.error( err ) ;
                response.errorHandlers.send500() ;
                return ;
            }
            // console.log( fields, files ) ;
            // console.log( files["picture"] ) ;

            let validateRes = validatePictureForm( fields, files ) ;
            if( validateRes === true ) {
                // OK
                const savedName = moveUploadedFile( files.picture ) ;

                addPicture( {
                    title:       fields.title,
                    description: fields.description,
                    place:       fields.place,
                    filename:    savedName
                }, request.services )
                .then( results => {
                    res = { status: results.affectedRows } ;
                    response.setHeader( 'Content-Type', 'application/json' ) ;
                    response.end( JSON.stringify( res ) ) ;
                } )
                .catch( err => {
                    console.error( err ) ;
                    response.errorHandlers.send500() ;
                } ) ;
            } else {
                // Validation error, validateRes - message
                response.errorHandlers.send412( validateRes ) ;
                return ;
            }
        } ) ;  
} ;

function doGet( request, response ) {
    // Возврать JSON данных по всем картинам
    request.services.dbPool.query( 
        "select p.*, cast(p.id AS CHAR) id_str from pictures p",
        ( err, results ) => {
        if( err ) {
            console.log( err ) ;
            response.errorHandlers.send500() ;
        } else {
            // console.log(results);
            response.setHeader( 'Content-Type', 'application/json' ) ;
            response.end( JSON.stringify( results ) ) ;
        }
    } ) ;
}


function addPicture( pic, services ) {
    const query = "INSERT INTO pictures(title, description, place, filename) VALUES (?, ?, ?, ?)" ;
    const params = [
        pic.title, 
        pic.description, 
        pic.place, 
        pic.filename ] ;
    return new Promise( ( resolve, reject ) => {
        services.dbPool.query( query, params, ( err, results ) => {
            if( err ) reject( err ) ;
            else resolve( results ) ;
        } ) ;
    } ) ;    
}

function moveUploadedFile( file ) {
    var counter = 1 ;
    var savedName ;
    do {
        // TODO: trim filename to 64 symbols
        savedName = `(${counter++})_${file.name}` ;
    } while( fs.existsSync( UPLOAD_PATH + savedName ) ) ;
    fs.rename( file.path, UPLOAD_PATH + savedName, 
        err => { if( err ) console.log( err ) ; } ) ;
    return savedName ;
}

function validatePictureForm( fields, files ) {
    // задание: проверить поля на наличие и допустимость
    if( typeof files["picture"] == 'undefined' ) {
        return "File required" ;
    }
    // title should be
    if( typeof fields["title"] == 'undefined' ) {
        return "Title required" ;
    }
    if( fields["title"].length == 0 ) {
        return "Title should be non-empty" ;
    }
    // description should be
    if( typeof fields["description"] == 'undefined' ) {
        return "Description required" ;
    }
    if( fields["description"].length == 0 ) {
        return "Description should be non-empty" ;
    }
    // place optional. But if present then should be non-empty
    if( typeof fields["place"] != 'undefined'
     && fields["place"].length == 0 ) {
        return "Place should be non-empty" ;
    }
    return true ;
}

function extractBody( request ) {
    return new Promise( ( resolve, reject ) => {
        let requestBody = [] ; // массив для чанков
        request
            .on( "data", chunk => requestBody.push( chunk ) )
            .on( "end", () => {
                try { 
                    resolve( JSON.parse( 
                        Buffer.concat( requestBody ).toString()
                    ) ) ;
                }
                catch( ex ) {
                    reject( ex ) ;
                }
           } ) ;
    } ) ;    
}
