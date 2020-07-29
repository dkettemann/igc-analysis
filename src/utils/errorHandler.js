/**
 * Displays IGCExceptions and throws a regular exception if the error is not of type IGCException.
 * @param e
 */
function errorHandler(e){
    if (e instanceof IGCException) {
        $('#errorMessage').text(e.message);
    } else {
        throw e;
    }
}
