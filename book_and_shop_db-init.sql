--create database tables

create table Users (
    username varchar(50) not null primary key,
    password varchar(50) not null,
    fname varchar(50) not null,
    lname varchar(50) not null,
    activeFlag integer not null,
    check (activeFlag = 0 or activeFlag = 1)
);

create table Professionals (
    profId integer not null primary key autoincrement,
    fname varchar(50) not null,
    lname varchar(50) not null,
    location varchar(50),
    specialty varchar(50)
);

create table Bookings (
    bookingId integer not null primary key autoincrement,
    bookedBy varchar(50) not null,
    profId integer not null,
    bookingDate date,
    bookingTime time,
    location varchar(50),
    notes text,
    foreign key (bookedBy) references Users (username),
    foreign key (profId) references Professionals (profId)
);

create table MedSupplies (
    id integer not null primary key autoincrement,
    name varchar(50) not null,
    description text,
    image varchar(50),
    price integer,
    _comment text
);

create table Orders (
    id integer not null primary key autoincrement,
    username varchar(50) not null,
    timestamp timestamp,
    totalCost integer,
    foreign key (username) references Users (username)
);

create table OrderDetails (
    orderId integer not null,
    medSupplyId integer not null,
    count integer,
    primary key (orderId, medSupplyId),
    foreign key (orderId) references Orders (id),
    foreign key (medSupplyId) references MedSupplies (id)
);

--store list of time slots for booking
create table TimeSelection (
    time varchar(20) not null primary key
);

insert into TimeSelection values
('08:00 AM'), ('08:15 AM'), ('08:30 AM'), ('08:45 AM'),
('09:00 AM'), ('09:15 AM'), ('09:30 AM'), ('09:45 AM'),
('10:00 AM'), ('10:15 AM'), ('10:30 AM'), ('10:45 AM'),
('11:00 AM'), ('11:15 AM'), ('11:30 AM'), ('11:45 AM'),
('12:00 PM'), ('12:15 PM'), ('12:30 PM'), ('12:45 PM'),
('01:00 PM'), ('01:15 PM'), ('01:30 PM'), ('01:45 PM'),
('02:00 PM'), ('02:15 PM'), ('02:30 PM'), ('02:45 PM'),
('03:00 PM'), ('03:15 PM'), ('03:30 PM'), ('03:45 PM'),
('04:00 PM'), ('04:15 PM'), ('04:30 PM'), ('04:45 PM'),
('05:00 PM'), ('05:15 PM'), ('05:30 PM'), ('05:45 PM');

--initialise Professionals table values
insert into Professionals (fname, lname, location, specialty) values
('Apple', 'Banana', 'Auckland', 'Occupational medicine'),
('Cinnamon', 'Durian', 'Hamilton', 'Musculoskeletal medicine'),
('Edamame', 'Fig', 'Napier', 'General practice'),
('Grape', 'Hazelnut', 'Christchurch', 'Emergency medicine');

-- initialise MedSupplies table values
insert into MedSupplies (name, description, image, price, _comment) values
("Blood Pressure Monitor", "Upper Arm Blood Pressure Monitor with Cuff that fits Standard and Large Arms", "BPMonitor.jpg", 80, "source: https://www.amazon.com/Omron-HEM-780-Automatic-Pressure-Monitor/dp/B0009XQUES"),
("Syringe and Needle", "Bag of 10 1cc 31g 5/16 inch", "SyringeAndNeedle.jpg", 10, "source: https://www.amazon.com/Bag-10-1cc-31g-inch/dp/B07CBPQ4YD/ref=sr_1_4?ie=UTF8&qid=1547840438&sr=8-4&keywords=syringe+with+needle"),
("Medical Gloves", "AMMEX - AINPF42100-BX - Medical Nitrile Gloves - Disposable, Powder Free, Exam Grade, 4 mil, Small, Indigo (Box of 100)", "Gloves.jpg", 15, "source: https://www.amazon.com/AMMEX-AINPF42100-BX-Medical-Nitrile-Disposable/dp/B00CF49QQI/ref=sr_1_2_sspa?ie=UTF8&qid=1547840647&sr=8-2-spons&keywords=medical+gloves&psc=1"),
("Stethoscope", "Clinical Grade Dual-Head Stethoscope by GreaterGoods. (Certified Refurbished) Classic Lightweight Design for The Medical Professional (Black Steel)", "Stethoscope.jpg", 55, "source: https://www.amazon.com/Stethoscope-GreaterGoods-Refurbished-Lightweight-Professional/dp/B07L4XVBDB/ref=sr_1_4?s=industrial&ie=UTF8&qid=1547840794&sr=1-4&keywords=stethoscope"),
("Automated External Defibrillator", "Philips HeartStart Home Defibrillator. Home defibrillator designed for ease of use and prompt response. Intuitive voice instructions offer step-by-step guidance for administering therapy.", "AED.jpg", 2000, "source: https://www.amazon.com/HeartStart-861284-Philips-Home-Defibrillator/dp/B00064CED6/ref=sr_1_1_a_it?ie=UTF8&qid=1547841129&sr=8-1-spons&keywords=automated+external+defibrillator&psc=1");