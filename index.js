// Сервер на JS
const HTTP_PORT    = 80 ;
const WWW_ROOT     = "www" ;
const FILE_404     = WWW_ROOT + "/404.html" ;
const DEFAULT_MIME = "application/octet-stream" ;

// Подключение модуля
const http = require( "http" ) ;
const fs   = require( "fs" ) ;   // file system

// Серверная функция
function serverFunction( request, response ) {
    // логируем запрос - это must have для всех серверов
    console.log( request.method + " " + request.url ) ;
    
    // разделяем запрос по "?" - отделяем параметры
    const requestParts = request.url.split( "?" ) ;
    // первая часть (до ?) - сам запрос
    const requestUrl = requestParts[ 0 ] ;
    // вторая часть - параметры по схеме key1=val1 & key2=val2
    var params = {} ;
    if( requestParts.length > 1 ) {  // есть вторая часть
        for( let keyval of requestParts[1].split( "&" ) ) {
            let pair = keyval.split( "=" ) ;
            params[ pair[0] ] = 
                typeof pair[1] == 'undefined'
                    ? null
                    : pair[1] ;
        }
    }
    console.log( params ) ;
    
    // проверить запрос на спецсимволы (../)
    const restrictedParts = [ "../", ";" ] ;
    for( let part of restrictedParts ) {
        if( requestUrl.indexOf( part ) !== -1 ) {
            // TODO: создать страницу "Опасный запрос"
            response.statusCode = 418 ;
            response.setHeader( 'Content-Type', 'text/plain' ) ;
            response.end( "I'm a teapot" ) ;
            return ;
        }
    }

    // проверяем, является ли запрос файлом
    const path = WWW_ROOT + requestUrl ;
    if( fs.existsSync( path )   // да, такой объект существует
     && fs.lstatSync( path ).isFile() ) {  // и это файл        
        sendFile( path, response ) ;
        return ;
    }
    // нет, это не файл. Маршрутизируем
    const url = requestUrl.substring(1) ;
    if( url == '' ) {
        // запрос / - передаем индексный файл
        sendFile( "www/index.html", response ) ;
    } else {
        // необработанный запрос - "не найдено" (404.html)
        sendFile( FILE_404, response, 404 ) ;  
    }
}

// Создание сервера (объект)
const server = http.createServer( serverFunction ) ;

// Запуск сервера - начало прослушивания порта
server.listen(  // регистрируемся в ОС на получение 
                // пакетов, адрессованных на наш порт 
    HTTP_PORT,  // номер порта
    () => {  // callback, после-обработчик, вызывается
             // после того, как "включится слушание"
        console.log( "Listen start, port " + HTTP_PORT ) ; 
    } 
) ;

// задание
async function sendFile2( path, response, statusCode ) {
    fs.readFile(
        path,
        ( err, data ) => {
            if( err ) {
                console.error( err ) ;
                return;
            }
            if( typeof statusCode == 'undefined' )
                statusCode = 200 ;
            response.statusCode = statusCode ;
            response.setHeader( 'Content-Type', 'text/html; charset=utf-8' ) ;
            response.end( data ) ;
        } );
}

// Stream - piping: stream copy from readable stream to writable
async function sendFile( path, response, statusCode=200 ) {
    var readStream = false ;
    if( fs.existsSync( path ) ) {
        readStream = fs.createReadStream( path ) ;
        //if( typeof statusCode == 'undefined' ) statusCode = 200 ;        
    } else if( fs.existsSync( FILE_404 ) ) {
        readStream = fs.createReadStream( FILE_404 ) ;
        statusCode = 404 ;
    }    
    
    if( readStream ) {
        response.statusCode = statusCode ;
        response.setHeader( 'Content-Type', getMimeType( path ) ) ;
        readStream.pipe( response ) ;
    } else {
        response.statusCode = 418 ;
        response.setHeader( 'Content-Type', 'text/plain' ) ;
        response.end( "I'm a teapot" ) ;
    }

    // задание: проверить наличие файла перед отправкой:
    // 1. ищем файл, если есть - отправляем
    // 2. если нет - ищем 404, отправляем (если есть)
    // 3. если нет - отправляем строку с 418 кодом
}

// returns Content-Type header value by parsing file name (path)
function getMimeType( path ) {
    // file extension
    if( ! path ) {
        return false ;
    }
    const dotPosition = path.lastIndexOf( '.' ) ;
    if( dotPosition == -1 ) {  // no extension
        return DEFAULT_MIME ;
    }
    const extension = path.substring( dotPosition + 1 ) ;
    switch( extension ) {
        case 'html' :
        case 'css'  :
            return 'text/' + extension ;
        case 'jpeg' :
        case 'jpg'  :
            return 'image/jpeg' ;
        case 'bmp'  :
        case 'gif'  :
        case 'png'  :
            return 'image/' + extension ;
        case 'json' :
        case 'pdf'  :
        case 'rtf'  :
            return 'application/' + extension ;
        default :
            return DEFAULT_MIME ;
    }
}