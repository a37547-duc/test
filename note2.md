# Mô tả cách hoạt động của Products

<!-- 1. Cần lấy được id của category - Cách này dài
   -> sử dụng id của category để lấy id các hãng sản phẩm của nó
   dựa trên id đó lấy ra các sản phẩm --> SAI

2. Sửa lỗi
   -> Nếu sử dụng bộ lọc thì sẽ dễ dàng hơn

1. Lấy được id và name của category
1. dựa vào id đó lấy được id và name của brand
1. dựa vào id brand => Lấy được sản phẩm (Product)

- bổ sung: có thể dựa vào id Product để lấy các variants của nó

# Lỗi - 3/10/2024

- Cần trả về số lượng hợp lý
- Mỗi loại sản phẩm được trả về cần ít nhất 5 loại
- lấy được thông tin của skud đầu tiên của 1 sản phẩm

# Lỗi - 4/10/2024

- Database cũ chỉ áp dụng cho sản phẩm laptop
- Cần phải áp dụng cho các sản phẩm khác như chuột, bàn phím,...
  -> Sửa: sử dụng Discriminators để kế thừa từ schema cũ

# Lỗi - 7/10/2024

- vì hàm lấy dữ liệu Product của admin trùng với lấy dữ liệu của Client
  -> Sửa: Cần tách ra 2 hàm riêng biệt: 1 client, 1 admin hoặc sử dụng rbac

# Lỗi - 7/10/2024

- Nếu sản phẩm chỉ có 1 variant làm sao để vô hiệu hóa chức năng thêm giỏ hàng của khách hàng
  -> Sửa(Tạm thời) : bỏ giỏ hàng ở trang chủ, vô hiệu hóa khi vô xem chi tiết.

# Lỗi - 8/10/2024

- Làm thế nào để lấy đc id của variant ở trang chủ, khi click vào thì hiện chi tiết
- bên trong chi tiết cần lấy đc các biến thể của nó

-> Luồng:

1.  Click vào sản phẩm sẽ link đến chi tiết sản phẩm đó
