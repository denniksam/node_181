
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

function doGet( request, response ) { response.end( "Votes works !!" ) ; }

function doPost( request, response ) {
    response.end( "POST Votes works !! user_id = , picture_id = , vote = " ) ;
}

function doPut( request, response ) { }

function doDelete( request, response ) { }

function doOptions( request, response ) { }
