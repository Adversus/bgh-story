# BGH Interactive Story

Technical configuration notes:

## Authentication

The administration URL is `${BASE_URL}/admin/` and is protected using
HTTP BASIC authentication. This is done with an .htpasswd file which
contains the encrypted username + password database along with an
.htaccess file which directs the web server to require a password for
access to the admin/ directory.  Any user with FTP access to the files
can update the passwords database by editing or replacing the
.htpasswd file.

Online htpasswd entry generator:
http://www.htaccesstools.com/htpasswd-generator/

Online htpasswd documentation:
http://httpd.apache.org/docs/2.2/programs/htpasswd.html

## Passwords

Presently, there are two passwords for access and maintenance to
Interactive Story sites:

1. MySQL database username and password. This provides access to all
   data behind the interactive story program. This information is kept
   in the `admin/config.php` file.

2. Administrative login for the web interface should be set with
   `admin/.htpasswd` and `admin/.htaccess` (Examples are provided in
   and .htaccess-dist)

## Site Configuration

To install, or move, the site there are a few configuration parameters
that must be kept up-to-date for the site to function. These are:

1. `adminURL` variable in `admin/admin.js`. This variable needs to be the
full URL of `admin/admin.php`. Many browsers require that this is the
same domain that is used to access the html (so www.example.com
vs. example.com may be significant)

2. All parameters in `config.php` are required to successfully connect
to the database.

3. The AuthUserFile path in .htaccess must be the absolute path to
.htpasswd. For convenience there is a php file that looks up and
displays this information under admin/htaccess-path.php

## Database Initialization

The database is configured using the schema under
`admin/database.sql`. The database names may need to be updating
depending on local configuration.

Once the schema is installed and variables in Site Configuration are
updated the first order of business is to log on to the site manager
and create a new story entitled, “DEFAULT_STORY”. This will have the
ID of 1 (one) and is significant in the rest of the program.

## Programming and Updating

The full source code for the site (including schema) is kept in a GIT
repository and hosted on github.com at
https://github.com/meyersh/bgh-story

Future groups are encouraged to contribute back changes to this
repository. Github makes social coding easy. Contact information for
the present owner of this repository is available by visiting the
provided URL above.