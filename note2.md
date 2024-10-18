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

# Lỗi - 4/10/2024 (Đã fix)

- Database cũ chỉ áp dụng cho sản phẩm laptop
- Cần phải áp dụng cho các sản phẩm khác như chuột, bàn phím,...
  -> Sửa: sử dụng Discriminators để kế thừa từ schema cũ

# Lỗi - 7/10/2024

- vì hàm lấy dữ liệu Product của admin trùng với lấy dữ liệu của Client
  -> Sửa: Cần tách ra 2 hàm riêng biệt: 1 client, 1 admin hoặc sử dụng rbac

# Lỗi - 7/10/2024

- Nếu sản phẩm chỉ có 1 variant làm sao để vô hiệu hóa chức năng thêm giỏ hàng của khách hàng
  -> Sửa(Tạm thời) : bỏ giỏ hàng ở trang chủ, vô hiệu hóa khi vô xem chi tiết.

# Lỗi - 8/10/2024(đã fix)

- Làm thế nào để lấy đc id của variant ở trang chủ, khi click vào thì hiện chi tiết
- bên trong chi tiết cần lấy đc các biến thể của nó

-> Luồng:

1.  Click vào sản phẩm sẽ link đến chi tiết sản phẩm đó

# Lỗi 14/10/2024 (Đã fix)

- Không lấy đc type để gán modal

1. Có thể fix bằng cách thêm cùng với category

- cần thêm trường type cùng với category

ví dụ:
{
name:"Laptop",
type:"LaptopVariants"
}
-> Lỗi khi tạo ra category cần chỉnh lại

- nếu mỗi khi thêm category thì cần phải khai báo thêm type
  -> Lỗi nếu type không tồn tại trong database gây lỗi
  -> Lỗi (Không sử dụng)

2. tạo trực tiếp từ add product

- Khi tạo kèm theeo type
- Khi lấy các biến thể -> gửi lại cho client type của cha (Không sử dụng)

3. Sử dụng middleware (thành công)

- cần phải truyền biến type sử dụng context api hoặc rtk

# Lỗi 15/10/2024

- Xây dựng lại soft delete
- Xây dựng lại sản phẩm trả về trang chủ
- Xây dựng lại sản phẩm trả về chi tiết sản phẩm

# Lỗi 18/10/2024

- Xây dựng lại trả về thương hiệu sản phẩm
