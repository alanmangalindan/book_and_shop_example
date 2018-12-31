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
    bookedBy varchar(50) not null,
    profId integer not null,
    bookingDate date,
    bookingTime time,
    location varchar(50),
    notes text,
    primary key (profId, bookingDate, bookingTime),
    foreign key (bookedBy) references Users (username),
    foreign key (profId) references Professionals (profId)
);

