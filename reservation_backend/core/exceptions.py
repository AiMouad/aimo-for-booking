from rest_framework.views import exception_handler
from rest_framework.exceptions import APIException
from rest_framework import status


def custom_exception_handler(exc, context):
    """Wrap DRF exception responses in a consistent envelope."""
    response = exception_handler(exc, context)

    if response is not None:
        error_payload = {
            'error': True,
            'code': response.status_code,
            'detail': response.data,
        }
        response.data = error_payload

    return response


class ConflictError(APIException):
    """HTTP 409 Conflict – e.g. reservation time slot already taken."""
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'A conflict occurred with an existing resource.'
    default_code = 'conflict'


class ServiceUnavailableError(APIException):
    """HTTP 503 Service Unavailable – e.g. AI service down."""
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'Service temporarily unavailable, please try again later.'
    default_code = 'service_unavailable'
