# Auth api

## code

curl -s -X POST http://localhost:11001/api/v1/auth/code -H 'Content-Type: application/json' \
-d '{"phone":"13820261001"}'

## login

curl -s -X POST http://localhost:11001/api/v1/auth/login -H 'Content-Type: application/json' \
-d '{"phone":"13820261001", "code":"288514"}'

## testVerifyToken

curl -s -X POST http://localhost:11001/api/v1/auth/testVerifyToken -H 'Content-Type: application/json' \
-d '{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsImlhdCI6MTc5MDg4MDg4MiwiZXhwIjoxNzkwODg4MDgyfQ.IvdTqNBeCr2rsofL48MgStZgRRJLWGrBHEBFjvwuYIY"}'
