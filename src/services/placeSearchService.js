// Google Maps-Style Place Search, Autocomplete, Reverse Geocoding & Real Road Routing for Thailand

export const THAILAND_PLACES_DB = [
  // กรุงเทพฯ และปริมณฑล (Bangkok & Metro)
  { name: "เซ็นทรัล เวสต์เกต (บางใหญ่)", sub: "อ.บางใหญ่ จ.นนทบุรี", lat: 13.8760, lng: 100.4115, corridor: "west", keywords: ["บางใหญ่", "เวสต์เกต", "westgate", "พระปิ่น 3", "พระปิ่น3"] },
  { name: "หมู่บ้านพระปิ่น 3 (บางใหญ่)", sub: "ถ.กาญจนาภิเษก อ.บางใหญ่ จ.นนทบุรี", lat: 13.8434, lng: 100.4034, corridor: "west", keywords: ["พระปิ่น 3", "พระปิ่น3", "บางแม่นาง", "บางใหญ่"] },
  { name: "ไทรน้อย (บิ๊กซี / ปตท. ไทรน้อย)", sub: "อ.ไทรน้อย จ.นนทบุรี", lat: 13.9800, lng: 100.3150, corridor: "west", keywords: ["ไทรน้อย", "บางกรวย-ไทรน้อย", "sainoi"] },
  { name: "บางบัวทอง (ถ.กาญจนาภิเษก)", sub: "อ.บางบัวทอง จ.นนทบุรี", lat: 13.9180, lng: 100.4080, corridor: "west", keywords: ["บางบัวทอง", "พิมลราช", "สมบัติบุรี"] },
  { name: "ปากเกร็ด / แจ้งวัฒนะ / เมืองทองธานี", sub: "อ.ปากเกร็ด จ.นนทบุรี", lat: 13.9120, lng: 100.5250, corridor: "north", keywords: ["ปากเกร็ด", "แจ้งวัฒนะ", "เมืองทอง", "อิมแพ็ค", "ชัยพฤกษ์"] },
  { name: "พระราม 5 / นครอินทร์ / ราชพฤกษ์", sub: "อ.เมือง/บางกรวย จ.นนทบุรี", lat: 13.8250, lng: 100.4780, corridor: "west", keywords: ["พระราม 5", "นครอินทร์", "ราชพฤกษ์", "เดอะคริสตัล"] },
  { name: "สยามพารากอน / สยามสแควร์", sub: "เขตปทุมวัน กรุงเทพมหานคร", lat: 13.7466, lng: 100.5347, corridor: "bkk", keywords: ["สยาม", "พารากอน", "siam", "paragon", "ปทุมวัน", "เซ็นทรัลเวิลด์"] },
  { name: "ไอคอนสยาม (ICONSIAM)", sub: "ถ.เจริญนคร เขตคลองสาน กรุงเทพฯ", lat: 13.7267, lng: 100.5105, corridor: "bkk", keywords: ["ไอคอนสยาม", "iconsiam", "เจริญนคร", "คลองสาน"] },
  { name: "เซ็นทรัล ลาดพร้าว / จตุจักร", sub: "เขตจตุจักร กรุงเทพมหานคร", lat: 13.8163, lng: 100.5608, corridor: "north", keywords: ["ลาดพร้าว", "จตุจักร", "หมอชิต", "วิภาวดี"] },
  { name: "เซ็นทรัล พระราม 2", sub: "ถ.พระราม 2 เขตบางขุนเทียน กรุงเทพฯ", lat: 13.6638, lng: 100.4385, corridor: "south", keywords: ["พระราม 2", "พระราม2", "บางขุนเทียน", "แสมดำ"] },
  { name: "เซ็นทรัล พระราม 3", sub: "เขตยานนาวา กรุงเทพมหานคร", lat: 13.6975, lng: 100.5378, corridor: "bkk", keywords: ["พระราม 3", "ยานนาวา", "สาทร", "สีลม"] },
  { name: "เซ็นทรัล อีสต์วิลล์ (เลียบด่วนรามอินทรา)", sub: "เขตลาดพร้าว กรุงเทพมหานคร", lat: 13.8037, lng: 100.6143, corridor: "east", keywords: ["อีสต์วิลล์", "เลียบด่วน", "รามอินทรา", "เกษตรนวมินทร์"] },
  { name: "เมกาบางนา (Mega Bangna)", sub: "ถ.บางนา-ตราด อ.บางพลี จ.สมุทรปราการ", lat: 13.6465, lng: 100.6800, corridor: "east", keywords: ["บางนา", "เมกาบางนา", "mega bangna", "บางพลี"] },
  { name: "ท่าอากาศยานสุวรรณภูมิ (Suvarnabhumi Airport)", sub: "อ.บางพลี จ.สมุทรปราการ", lat: 13.6900, lng: 100.7501, corridor: "east", keywords: ["สุวรรณภูมิ", "สนามบินสุวรรณภูมิ", "airport", "ลาดกระบัง"] },
  { name: "ท่าอากาศยานดอนเมือง (Don Mueang Airport)", sub: "เขตดอนเมือง กรุงเทพมหานคร", lat: 13.9126, lng: 100.6067, corridor: "north", keywords: ["ดอนเมือง", "สนามบินดอนเมือง", "รังสิต"] },
  { name: "ฟิวเจอร์พาร์ค รังสิต", sub: "อ.ธัญบุรี จ.ปทุมธานี", lat: 13.9890, lng: 100.6170, corridor: "north", keywords: ["รังสิต", "ฟิวเจอร์", "ปทุมธานี", "คลองหลวง", "มธ"] },
  { name: "เซ็นทรัล ปิ่นเกล้า / บรมราชชนนี", sub: "เขตบางกอกน้อย กรุงเทพมหานคร", lat: 13.7780, lng: 100.4765, corridor: "west", keywords: ["ปิ่นเกล้า", "บรมราชชนนี", "ตลิ่งชัน", "สายใต้ใหม่"] },
  { name: "มหาชัย / สมุทรสาคร (ถ.พระราม 2)", sub: "อ.เมืองสมุทรสาคร จ.สมุทรสาคร", lat: 13.5475, lng: 100.2736, corridor: "south", keywords: ["มหาชัย", "สมุทรสาคร", "พอร์โต้ ชิโน่"] },
  { name: "อัมพวา / แม่กลอง (สมุทรสงคราม)", sub: "อ.เมือง/อัมพวา จ.สมุทรสงคราม", lat: 13.4125, lng: 99.9980, corridor: "south", keywords: ["อัมพวา", "แม่กลอง", "สมุทรสงคราม", "วัดจุฬามณี", "วังมะนาว"] },

  // ภาคตะวันตก (West)
  { name: "องค์พระปฐมเจดีย์ / เซ็นทรัล นครปฐม", sub: "อ.เมืองนครปฐม จ.นครปฐม", lat: 13.8196, lng: 100.0601, corridor: "west", keywords: ["นครปฐม", "องค์พระ", "นครชัยศรี", "ศาลายา", "กำแพงแสน"] },
  { name: "เมืองราชบุรี / สวนผึ้ง", sub: "อ.เมืองราชบุรี จ.ราชบุรี", lat: 13.5283, lng: 99.8134, corridor: "west", keywords: ["ราชบุรี", "สวนผึ้ง", "ดำเนินสะดวก", "โพธาราม"] },
  { name: "เมืองกาญจนบุรี / สะพานข้ามแม่น้ำแคว", sub: "อ.เมืองกาญจนบุรี จ.กาญจนบุรี", lat: 14.0228, lng: 99.5328, corridor: "west", keywords: ["กาญจนบุรี", "เมืองกาญจน์", "แม่น้ำแคว", "ไทรโยค", "เอราวัณ", "สังขละบุรี"] },
  { name: "เมืองสุพรรณบุรี / มังกรสวรรค์", sub: "อ.เมืองสุพรรณบุรี จ.สุพรรณบุรี", lat: 14.4745, lng: 100.1177, corridor: "north", keywords: ["สุพรรณบุรี", "สุพรรณ", "สามชุก"] },

  // ภาคใต้ (South)
  { name: "ชะอำ (หาดชะอำ / ท่ายาง)", sub: "อ.ชะอำ จ.เพชรบุรี", lat: 12.8000, lng: 99.9667, corridor: "south", keywords: ["ชะอำ", "เพชรบุรี", "ท่ายาง", "เขาวัง", "แก่งกระจาน"] },
  { name: "หัวหิน (มาร์เก็ตวิลเลจ / บลูพอร์ต หัวหิน)", sub: "อ.หัวหิน จ.ประจวบคีรีขันธ์", lat: 12.5684, lng: 99.9577, corridor: "south", keywords: ["หัวหิน", "huahin", "ปราณบุรี", "เขาตะเกียบ"] },
  { name: "ประจวบคีรีขันธ์ (อ่าวมะนาว / ทับสะแก / บางสะพาน)", sub: "อ.เมืองประจวบคีรีขันธ์", lat: 11.8124, lng: 99.7973, corridor: "south", keywords: ["ประจวบ", "ทับสะแก", "บางสะพาน", "อ่าวมะนาว"] },
  { name: "ชุมพร (ท่าแซะ / ปะทิว / เมืองชุมพร)", sub: "อ.เมืองชุมพร จ.ชุมพร", lat: 10.4930, lng: 99.1800, corridor: "south", keywords: ["ชุมพร", "ท่าแซะ", "หลังสวน"] },
  { name: "ระนอง (บ่อน้ำพุร้อนรักษะวาริน)", sub: "อ.เมืองระนอง จ.ระนอง", lat: 9.9658, lng: 98.6348, corridor: "south", keywords: ["ระนอง"] },
  { name: "สุราษฎร์ธานี (เซ็นทรัล สุราษฎร์ / เขาสก)", sub: "อ.เมืองสุราษฎร์ธานี", lat: 9.1382, lng: 99.3217, corridor: "south", keywords: ["สุราษฎร์", "สุราษฎร์ธานี", "สมุย", "พะงัน", "เขาสก"] },
  { name: "นครศรีธรรมราช (วัดพระมหาธาตุ / ขนอม)", sub: "อ.เมืองนครศรีธรรมราช", lat: 8.4304, lng: 99.9631, corridor: "south", keywords: ["นครศรีธรรมราช", "เมืองคอน", "วัดเจดีย์", "ไอ้ไข่", "ขนอม", "ทุ่งสง"] },
  { name: "กระบี่ (อ่าวนาง / เมืองกระบี่)", sub: "อ.เมืองกระบี่ จ.กระบี่", lat: 8.0863, lng: 98.9063, corridor: "south", keywords: ["กระบี่", "อ่าวนาง"] },
  { name: "พังงา (เขาหลัก / เสม็ดนางชี)", sub: "อ.เมือง/ตะกั่วป่า จ.พังงา", lat: 8.4501, lng: 98.5255, corridor: "south", keywords: ["พังงา", "เขาหลัก"] },
  { name: "ภูเก็ต (เมืองภูเก็ต / ป่าตอง / เซ็นทรัล ภูเก็ต)", sub: "อ.เมืองภูเก็ต จ.ภูเก็ต", lat: 7.8804, lng: 98.3923, corridor: "south", keywords: ["ภูเก็ต", "phuket", "ป่าตอง", "ถลาง"] },
  { name: "ตรัง (เมืองตรัง)", sub: "อ.เมืองตรัง จ.ตรัง", lat: 7.5563, lng: 99.6114, corridor: "south", keywords: ["ตรัง"] },
  { name: "พัทลุง (เมืองพัทลุง / ทะเลน้อย)", sub: "อ.เมืองพัทลุง จ.พัทลุง", lat: 7.6167, lng: 100.0740, corridor: "south", keywords: ["พัทลุง"] },
  { name: "หาดใหญ่ / สงขลา (เซ็นทรัล หาดใหญ่)", sub: "อ.หาดใหญ่ จ.สงขลา", lat: 7.0086, lng: 100.4747, corridor: "south", keywords: ["หาดใหญ่", "สงขลา", "สะเดา"] },
  { name: "สตูล / ปัตตานี / ยะลา / นราธิวาส", sub: "ภาคใต้ตอนล่าง", lat: 6.5411, lng: 101.2804, corridor: "south", keywords: ["สตูล", "ปัตตานี", "ยะลา", "เบตง", "นราธิวาส"] },

  // ภาคตะวันออก (East)
  { name: "ฉะเชิงเทรา (วัดหลวงพ่อโสธร / บางปะกง)", sub: "อ.เมืองฉะเชิงเทรา จ.ฉะเชิงเทรา", lat: 13.6904, lng: 101.0779, corridor: "east", keywords: ["ฉะเชิงเทรา", "แปดริ้ว", "หลวงพ่อโสธร", "บางปะกง"] },
  { name: "ชลบุรี / บางแสน / อ่างศิลา", sub: "อ.เมืองชลบุรี จ.ชลบุรี", lat: 13.2845, lng: 100.9145, corridor: "east", keywords: ["ชลบุรี", "บางแสน", "อ่างศิลา", "อมตะนคร"] },
  { name: "ศรีราชา / แหลมฉบัง / บางพระ", sub: "อ.ศรีราชา จ.ชลบุรี", lat: 13.1737, lng: 100.9311, corridor: "east", keywords: ["ศรีราชา", "แหลมฉบัง", "สวนเสือ"] },
  { name: "พัทยา / จอมเทียน (เซ็นทรัล พัทยา / เทอร์มินอล 21)", sub: "อ.บางละมุง จ.ชลบุรี", lat: 12.9236, lng: 100.8825, corridor: "east", keywords: ["พัทยา", "pattaya", "จอมเทียน", "บางละมุง"] },
  { name: "สัตหีบ / แสมสาร / สนามบินอู่ตะเภา", sub: "อ.สัตหีบ จ.ชลบุรี", lat: 12.6664, lng: 100.9007, corridor: "east", keywords: ["สัตหีบ", "แสมสาร", "อู่ตะเภา", "บางเสร่"] },
  { name: "ระยอง (หาดแม่รำพึง / บ้านเพ / เกาะเสม็ด)", sub: "อ.เมืองระยอง จ.ระยอง", lat: 12.6814, lng: 101.2816, corridor: "east", keywords: ["ระยอง", "บ้านเพ", "เสม็ด", "มาบตาพุด", "บ้านฉาง", "แกลง"] },
  { name: "จันทบุรี (เมืองจันทบุรี / หาดเจ้าหลาว / เขาคิชฌกูฏ)", sub: "อ.เมืองจันทบุรี จ.จันทบุรี", lat: 12.6114, lng: 102.1039, corridor: "east", keywords: ["จันทบุรี", "เมืองจันท์", "เขาคิชฌกูฏ", "เจ้าหลาว"] },
  { name: "ตราด / ท่าเรือเกาะช้าง (แหลมงอบ)", sub: "อ.เมือง/แหลมงอบ จ.ตราด", lat: 12.2428, lng: 102.5175, corridor: "east", keywords: ["ตราด", "เกาะช้าง", "เกาะกูด"] },
  { name: "นครนายก (เขื่อนขุนด่านปราการชล) / ปราจีนบุรี / สระแก้ว", sub: "ภาคตะวันออก", lat: 14.2069, lng: 101.2131, corridor: "northeast", keywords: ["นครนายก", "เขื่อนขุนด่าน", "ปราจีนบุรี", "สระแก้ว", "อรัญประเทศ", "โรงเกลือ"] },

  // ภาคตะวันออกเฉียงเหนือ / อีสาน (Northeast)
  { name: "สระบุรี / แก่งคอย / มวกเหล็ก", sub: "อ.เมือง/มวกเหล็ก จ.สระบุรี", lat: 14.5289, lng: 100.9101, corridor: "northeast", keywords: ["สระบุรี", "มวกเหล็ก", "แก่งคอย", "เจ็ดสาวน้อย"] },
  { name: "เขาใหญ่ / ปากช่อง (อุทยานแห่งชาติเขาใหญ่)", sub: "อ.ปากช่อง จ.นครราชสีมา", lat: 14.6050, lng: 101.4120, corridor: "northeast", keywords: ["เขาใหญ่", "ปากช่อง", "khaoyai", "ลำตะคอง", "สีคิ้ว", "วังน้ำเขียว"] },
  { name: "นครราชสีมา / โคราช (ย่าโม / เซ็นทรัล โคราช)", sub: "อ.เมืองนครราชสีมา", lat: 14.9799, lng: 102.0978, corridor: "northeast", keywords: ["โคราช", "นครราชสีมา", "korat", "พิมาย"] },
  { name: "บุรีรัมย์ (สนามช้างอารีนา / ปราสาทพนมรุ้ง)", sub: "อ.เมืองบุรีรัมย์ จ.บุรีรัมย์", lat: 14.9930, lng: 103.1029, corridor: "northeast", keywords: ["บุรีรัมย์", "นางรอง"] },
  { name: "สุรินทร์ / ศรีสะเกษ", sub: "อีสานใต้", lat: 14.8829, lng: 103.4937, corridor: "northeast", keywords: ["สุรินทร์", "ศรีสะเกษ"] },
  { name: "อุบลราชธานี (เซ็นทรัล อุบล / ผาแต้ม)", sub: "อ.เมืองอุบลราชธานี", lat: 15.2287, lng: 104.8564, corridor: "northeast", keywords: ["อุบล", "อุบลราชธานี", "โขงเจียม", "อำนาจเจริญ", "ยโสธร"] },
  { name: "ชัยภูมิ (มอหินขาว / ทุ่งดอกกระเจียว)", sub: "อ.เมืองชัยภูมิ จ.ชัยภูมิ", lat: 15.8068, lng: 102.0315, corridor: "northeast", keywords: ["ชัยภูมิ"] },
  { name: "ขอนแก่น (เซ็นทรัล ขอนแก่น / ม.ขอนแก่น)", sub: "อ.เมืองขอนแก่น จ.ขอนแก่น", lat: 16.4322, lng: 102.8236, corridor: "northeast", keywords: ["ขอนแก่น", "บ้านไผ่", "ชุมแพ"] },
  { name: "มหาสารคาม / ร้อยเอ็ด / กาฬสินธุ์", sub: "อีสานกลาง", lat: 16.0538, lng: 103.6520, corridor: "northeast", keywords: ["มหาสารคาม", "ร้อยเอ็ด", "กาฬสินธุ์"] },
  { name: "อุดรธานี (เซ็นทรัล อุดร / คำชะโนด)", sub: "อ.เมืองอุดรธานี จ.อุดรธานี", lat: 17.4138, lng: 102.7872, corridor: "northeast", keywords: ["อุดร", "อุดรธานี", "คำชะโนด", "หนองบัวลำภู"] },
  { name: "หนองคาย (สะพานมิตรภาพไทย-ลาว)", sub: "อ.เมืองหนองคาย จ.หนองคาย", lat: 17.8783, lng: 102.7420, corridor: "northeast", keywords: ["หนองคาย", "บึงกาฬ", "ถ้ำนาคา"] },
  { name: "เลย / เชียงคาน / ภูกระดึง", sub: "อ.เมือง/เชียงคาน จ.เลย", lat: 17.4860, lng: 101.7223, corridor: "northeast", keywords: ["เลย", "เชียงคาน", "ภูกระดึง", "ภูเรือ"] },
  { name: "สกลนคร / นครพนม (พระธาตุพนม) / มุกดาหาร", sub: "อีสานริมโขง", lat: 17.3920, lng: 104.7695, corridor: "northeast", keywords: ["สกลนคร", "นครพนม", "พระธาตุพนม", "มุกดาหาร"] },

  // ภาคกลาง และ ภาคเหนือ (Central & North)
  { name: "พระนครศรีอยุธยา (เซ็นทรัล อยุธยา / ตลาดกุ้ง)", sub: "อ.พระนครศรีอยุธยา จ.อยุธยา", lat: 14.3532, lng: 100.5684, corridor: "north", keywords: ["อยุธยา", "บางปะอิน", "วังน้อย"] },
  { name: "อ่างทอง / สิงห์บุรี / ชัยนาท / ลพบุรี", sub: "สายเอเชีย ทล.32", lat: 14.8920, lng: 100.3980, corridor: "north", keywords: ["อ่างทอง", "สิงห์บุรี", "ชัยนาท", "ลพบุรี"] },
  { name: "นครสวรรค์ (พาสาน / ปากน้ำโพ / เซ็นทรัล นครสวรรค์)", sub: "อ.เมืองนครสวรรค์ จ.นครสวรรค์", lat: 15.7047, lng: 100.1372, corridor: "north", keywords: ["นครสวรรค์", "ปากน้ำโพ", "อุทัยธานี"] },
  { name: "เพชรบูรณ์ / เขาค้อ / ภูทับเบิก", sub: "อ.เมือง/เขาค้อ จ.เพชรบูรณ์", lat: 16.6250, lng: 101.0050, corridor: "north", keywords: ["เพชรบูรณ์", "เขาค้อ", "ภูทับเบิก", "วัดผาซ่อนแก้ว", "วิเชียรบุรี"] },
  { name: "พิษณุโลก (วัดพระศรีรัตนมหาธาตุ พระพุทธชินราช)", sub: "อ.เมืองพิษณุโลก จ.พิษณุโลก", lat: 16.8211, lng: 100.2659, corridor: "north", keywords: ["พิษณุโลก", "พระพุทธชินราช", "พิจิตร"] },
  { name: "กำแพงเพชร / สุโขทัย (อุทยานประวัติศาสตร์สุโขทัย)", sub: "ภาคเหนือตอนล่าง", lat: 16.4828, lng: 99.5227, corridor: "north", keywords: ["กำแพงเพชร", "สุโขทัย", "อุตรดิตถ์"] },
  { name: "ตาก / แม่สอด (เขื่อนภูมิพล)", sub: "อ.เมืองตาก จ.ตาก", lat: 16.8840, lng: 99.1258, corridor: "north", keywords: ["ตาก", "แม่สอด"] },
  { name: "ลำปาง / ลำพูน", sub: "อ.เมืองลำปาง จ.ลำปาง", lat: 18.2888, lng: 99.4909, corridor: "north", keywords: ["ลำปาง", "ลำพูน", "แพร่", "น่าน", "พะเยา"] },
  { name: "เชียงใหม่ (ประตูท่าแพ / นิมมาน / เซ็นทรัล เชียงใหม่)", sub: "อ.เมืองเชียงใหม่ จ.เชียงใหม่", lat: 18.7883, lng: 98.9853, corridor: "north", keywords: ["เชียงใหม่", "chiangmai", "ดอยสุเทพ", "แม่ริม", "ม่อนแจ่ม", "ดอยอินทนนท์"] },
  { name: "เชียงราย (วัดร่องขุ่น / แม่สาย / สิงห์ปาร์ค)", sub: "อ.เมืองเชียงราย จ.เชียงราย", lat: 19.9105, lng: 99.8406, corridor: "north", keywords: ["เชียงราย", "วัดร่องขุ่น", "แม่สาย", "ภูชี้ฟ้า", "แม่ฮ่องสอน", "ปาย"] }
];

export function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function inferCorridorFromCoords(lat, lng) {
  if (lat < 13.45 && lng < 100.35) return "south";
  if (lat < 13.65 && lng >= 100.65) return "east";
  if (lat >= 14.30 && lng >= 101.00) return "northeast";
  if (lat >= 14.20 && lng < 101.00) return "north";
  if (lng < 100.38) return "west";
  return "bkk";
}

// Search local Thailand database immediately (0ms latency)
export function searchLocalThailandPlaces(query, userLocation, allStations = []) {
  const q = (query || '').trim().toLowerCase();
  const results = [];

  // Check if user pasted raw lat,lng coordinates (e.g. "13.8760, 100.4115")
  const coordMatch = q.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    results.push({
      id: `coord-${lat}-${lng}`,
      name: `พิกัด ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      sub: "พิกัด GPS ที่ระบุโดยตรง",
      lat,
      lng,
      corridor: inferCorridorFromCoords(lat, lng),
      source: "coords"
    });
  }

  for (const place of THAILAND_PLACES_DB) {
    if (!q) {
      results.push({ ...place, id: `local-${place.name}`, source: "local" });
      continue;
    }
    const nameMatch = place.name.toLowerCase().includes(q);
    const subMatch = place.sub.toLowerCase().includes(q);
    const kwMatch = place.keywords.some(k => k.toLowerCase().includes(q) || q.includes(k.toLowerCase()));
    if (nameMatch || subMatch || kwMatch) {
      results.push({ ...place, id: `local-${place.name}`, source: "local" });
    }
  }

  // Also search EV charging stations in nationwide dataset
  if (q.length >= 2 && Array.isArray(allStations)) {
    for (const st of allStations) {
      if (
        (st.name || '').toLowerCase().includes(q) ||
        (st.address || '').toLowerCase().includes(q) ||
        (st.province || '').toLowerCase().includes(q)
      ) {
        results.push({
          id: `st-${st.id}`,
          name: st.name,
          sub: `${st.address || st.province || ''} (${st.provider})`,
          lat: st.coordinates.lat,
          lng: st.coordinates.lng,
          corridor: st.region || inferCorridorFromCoords(st.coordinates.lat, st.coordinates.lng),
          source: "station"
        });
      }
    }
  }

  // Add distance from user if available
  return results.slice(0, 10).map(item => ({
    ...item,
    distanceKm: userLocation?.lat
      ? calculateHaversineKm(userLocation.lat, userLocation.lng, item.lat, item.lng)
      : null
  }));
}

// Live Online Thailand Geocoding Search (OpenStreetMap Nominatim Thailand API — Free, No API Key Needed)
export async function searchOnlineThailandPlaces(query, userLocation) {
  const q = (query || '').trim();
  if (q.length < 2) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&countrycodes=th&accept-language=th&limit=6&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item, idx) => {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      const parts = (item.display_name || '').split(',').map(s => s.trim());
      const mainTitle = item.name || parts[0] || q;
      const subAddress = parts.slice(1, 4).join(' • ') || item.display_name;

      return {
        id: `osm-${item.place_id || idx}`,
        name: mainTitle,
        sub: subAddress,
        lat,
        lng,
        corridor: inferCorridorFromCoords(lat, lng),
        source: "online",
        distanceKm: userLocation?.lat
          ? calculateHaversineKm(userLocation.lat, userLocation.lng, lat, lng)
          : null
      };
    });
  } catch (err) {
    console.warn('Online place search fallback:', err);
    return [];
  }
}

// Reverse Geocode GPS coordinates into a real Thai road/subdistrict/district name like Google Maps
export async function reverseGeocodeThailand(lat, lng) {
  if (!lat || !lng) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=th`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.address) return null;

    const a = data.address;
    const road = a.road || a.Amenity || a.neighbourhood || '';
    const subdistrict = a.suburb || a.tambon || a.village || a.quarter || '';
    const district = a.city_district || a.county || a.municipality || a.town || '';
    const province = a.state || a.province || a.city || '';

    const parts = [road, subdistrict, district, province].filter(Boolean);
    if (parts.length > 0) {
      return parts.slice(0, 3).join(' • ');
    }
    return data.display_name?.split(',').slice(0, 2).join(' ') || null;
  } catch {
    return null;
  }
}

// Live OSRM Road Routing API (Calculates exact highway road distance & driving time in Thailand)
export async function fetchRealDrivingRoute(originLat, originLng, destLat, destLng) {
  if (!originLat || !originLng || !destLat || !destLng) return null;
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=false`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.routes?.[0]) {
      const route = data.routes[0];
      const distanceKm = Math.max(1, Math.round(route.distance / 1000));
      const durationMin = Math.max(5, Math.round(route.duration / 60));
      return {
        distanceKm,
        durationMin
      };
    }
    return null;
  } catch {
    return null;
  }
}

