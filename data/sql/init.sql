CREATE TABLE posts (
    id integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    write_time TIMESTAMP DEFAULT(DATETIME('now', 'localtime')),
    message varchar NOT NULL,
    heart integer NOT NULL DEFAULT 0
);

CREATE TABLE replies (
    id integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    write_time TIMESTAMP DEFAULT(DATETIME('now', 'localtime')),
    message varchar NOT NULL,
    post_id integer NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) on delete cascade
);