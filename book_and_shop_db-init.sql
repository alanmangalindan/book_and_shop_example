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