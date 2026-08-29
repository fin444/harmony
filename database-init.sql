drop table if exists "message" cascade;
drop table if exists "group_user" cascade;
drop table if exists "channel" cascade;
drop table if exists "group" cascade;
drop table if exists "user" cascade;
drop table if exists "file" cascade;

create table "file" (
	"id" integer primary key generated always as identity,
	"name" varchar(40) not null
);

create table "group" (
	"id" integer primary key generated always as identity,
	"name" varchar(40) not null
);

create table "user" (
	"id" integer primary key generated always as identity,
	"username" varchar(20) not null,
	"password" varchar(32) not null,
	"pfpId" integer not null references "file"("id")
);

create table "group_user" (
	"userId" integer not null references "user"("id"),
	"groupId" integer not null references "group"("id"),
	constraint "prevent_dupes" unique("userId", "groupId")
);

create table "channel" (
	"id" integer primary key generated always as identity,
	"groupId" integer not null references "group"("id"),
	"name" varchar(40) not null
);

create table "message" (
	"id" integer primary key generated always as identity,
	"userId" integer not null references "user"("id"),
	"channelId" integer not null references "channel"("id"),
	"fileId" integer references "file"("id"),
	"contents" varchar(512) not null,
	"reply" integer,
	"timestamp" int8 not null
);

-- force this file to always have ID 1
insert into "file"("name") values('default-pfp.png');
