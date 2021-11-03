

module.exports = {
    analyze: function( request, response ) {
        // response.setHeader('Access-Control-Allow-Origin', '*');
        const method = request.method.toUpperCase() ;
        switch( method ) {
            case 'GET'  :  
                doGet( request, response ) ;
                break ;
            case 'POST' :  
                doPost( request, response ) ;
                break ;
            case 'DELETE' :  
                doDelete( request, response ) ;
                break ;
            case 'PUT' :  
                doPut( request, response ) ;
                break ;
            case 'OPTIONS' :  
                doOptions( request, response ) ;
                break ;
        }
    }
} ;

function doGet( request, response ) {

    response.end( JSON.stringify( request.params.query ) ) ;
}

function doPost( request, response ) {
    response.end() ;
}

function doDelete( request, response ) {
    response.end() ;
}

function doPut( request, response ) {
    response.end() ;
}

function doOptions( request, response ) {
    response.end() ;
}

