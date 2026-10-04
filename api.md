# Auth api

## code

curl -s -X POST http://localhost:11001/api/v1/auth/code -H 'Content-Type: application/json' \
-d '{"phone":"13820261001"}'

## login

curl -s -X POST http://localhost:11001/api/v1/auth/login -H 'Content-Type: application/json' \
-d '{"phone":"13820261001", "code":"485536"}'

## testVerifyToken

curl -s -X POST http://localhost:11001/api/v1/auth/testVerifyToken -H 'Content-Type: application/json' \
-d '{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsImlhdCI6MTc5MDg4MDg4MiwiZXhwIjoxNzkwODg4MDgyfQ.IvdTqNBeCr2rsofL48MgStZgRRJLWGrBHEBFjvwuYIY"}'

## profile

curl -s http://localhost:11001/api/v1/auth/profile -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsImlhdCI6MTc5MDg4MzM2NywiZXhwIjoxNzkwODgzMzY4fQ.qucngAKhON2SJ_61octHgzuTx04MBbAzicyWYTl2Gxk"

curl -s http://localhost:11001/api/v1/cart/items -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjgsImlhdCI6MTc5MTA0ODIxNSwiZXhwIjoxNzkxMDU1NDE1fQ.9F4U2_gWb_S_zz10hC_eIHgusNXhV5XyZSgkIOtvjc4"

curl -s -X PATCH http://localhost:11001/api/v1/cart/items/2 \
-H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
-d '{"quantity":-5}'

curl -s -X POST http://localhost:11001/api/v1/cart/items -H "Authorization: Bearer $TOKEN" \
-H 'Content-Type: application/json' -d '{"skuId":212,"quantity":2}'

npx autocannon -c 10 -d 2 -m POST \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjgsImlhdCI6MTc5MTEwODQyMiwiZXhwIjoxNzkxMTE1NjIyfQ.PDclfui1FtQ1HKsi2zrLyU1-K6BNguqAreFt6kCy0Sg" -H 'Content-Type: application/json' \
-b '{"skuId":18,"quantity":1}' \
http://localhost:11001/api/v1/orders
