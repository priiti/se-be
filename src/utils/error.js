const SubclassError = require('subclass-error');
const HTTPStatus = require('http-status');

exports.Error = SubclassError('Error', { status: HTTPStatus.BAD_REQUEST, message: 'Bad request' });

exports.NotAuthorizedError = SubclassError('NotAuthorizedError', { status: HTTPStatus.UNAUTHORIZED, message: 'Unauthorized' });
exports.ForbiddenError = SubclassError('ForbiddenError', { status: HTTPStatus.FORBIDDEN });
exports.NotFoundError = SubclassError('NotFoundError', { status: HTTPStatus.NOT_FOUND });
exports.UnprocessableEntityError = SubclassError('UnprocessableEntityError', { status: HTTPStatus.UNPROCESSABLE_ENTITY });
exports.ServerError = SubclassError('ServerError', { status: HTTPStatus.INTERNAL_SERVER_ERROR, message: 'Server error' });

exports.notFound = (req, res) => res.status(404).send('Not Found');

exports.errorHandler = (err, req, res, next) => {
  res.status(err.status || HTTPStatus.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errors: err.errors || undefined
  });
};
