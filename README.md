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

## Deploy Fly.io

App đã có `Dockerfile` và `fly.toml`. Trước khi deploy, đặt các secret thật trên Fly:

```powershell
fly secrets set META_VERIFY_TOKEN="token-ban-tu-dat"
fly secrets set META_PAGE_ACCESS_TOKEN="page-access-token-that"
fly secrets set META_APP_SECRET="app-secret-that"
fly secrets set PUBLIC_BASE_URL="https://th-moi.fly.dev"
```

Deploy:

```powershell
fly deploy
```

Nếu app name `th-moi` đã bị người khác lấy, đổi dòng `app = "th-moi"` trong `fly.toml` sang tên app Fly của bạn, hoặc chạy:

```powershell
fly apps create ten-app-cua-ban
```

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
