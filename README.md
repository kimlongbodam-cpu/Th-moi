# Facebook Messenger Invite Webhook

App này nhận tin nhắn từ Facebook Page Messenger, lấy tên và ảnh đại diện của người nhắn bằng Meta User Profile API, rồi ghép vào mẫu thư mời sự kiện.

## Chạy local

1. Cài Node.js 20+.
2. Tạo file `.env` từ `.env.example` và điền token thật.
3. Chạy:

```powershell
npm run check
npm start
```

Server mặc định chạy ở `http://localhost:3000`.

## Cấu hình Meta Webhook

Trong Meta Developers, cấu hình webhook cho Messenger:

- Callback URL: `https://your-domain.example/webhook`
- Verify token: giá trị `META_VERIFY_TOKEN`
- Subscribe Page vào trường `messages`

Khi người dùng nhắn vào Page, app sẽ:

1. Nhận `sender.id` từ webhook.
2. Gọi Graph API lấy `first_name,last_name,profile_pic`.
3. Lưu profile vào `data/profiles.json`.
4. Log link thư mời:

```text
/invite/{PSID}
```

## Các endpoint

- `GET /health` kiểm tra server.
- `GET /webhook` xác minh webhook với Meta.
- `POST /webhook` nhận tin nhắn Messenger.
- `GET /profiles` xem danh sách người đã nhắn.
- `GET /invite/{psid}` render thư mời HTML.
- `GET /invite/{psid}?eventName=...&date=...&time=...&location=...&host=...` ghi đè thông tin sự kiện.

## Lưu ý

- Không scrape Facebook. Chỉ dùng dữ liệu người đã nhắn vào Page hoặc đã cấp quyền hợp lệ.
- Nên đặt `META_APP_SECRET` để xác thực chữ ký webhook `X-Hub-Signature-256`.
- `profile_pic` là URL từ Meta, có thể hết hạn hoặc không có tùy tài khoản/quyền.
