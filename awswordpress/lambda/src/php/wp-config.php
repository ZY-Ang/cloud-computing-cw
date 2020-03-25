<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', getenv('DATABASE_NAME') );

/** MySQL database username */
define( 'DB_USER', 'dbase_username_here' );

/** MySQL database password */
define( 'DB_PASSWORD', 'dbase_password_here' );

/** MySQL hostname */
define( 'DB_HOST', getenv('DATABASE_ENDPOINT') );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

define('WP_SITEURL', 'https://cloudfront_domain_here');
define('WP_HOME', 'https://cloudfront_domain_here');
$_SERVER['HTTP_HOST'] = 'cloudfront_domain_here';

define( 'AS3CF_SETTINGS', serialize( array(
    // Storage Provider ('aws', 'do', 'gcp')
    'provider' => 'aws',
    // Access Key ID for Storage Provider (aws and do only, replace '*')
//    'access-key-id' => '********************',
    // Secret Access Key for Storage Providers (aws and do only, replace '*')
//    'secret-access-key' => '**************************************',
    // GCP Key File Path (gcp only)
    // Make sure hidden from public website, i.e. outside site's document root.
//    'key-file-path' => '/path/to/key/file.json',
    // Use IAM Roles on Amazon Elastic Compute Cloud (EC2) or Google Compute Engine (GCE)
    'use-server-roles' => true,
    // Bucket to upload files to
    'bucket' => getenv('S3_UPLOADS_BUCKET'),
    // Bucket region (e.g. 'us-west-1' - leave blank for default region)
    'region' => getenv('AWS_REGION'),
    // Automatically copy files to bucket on upload
    'copy-to-s3' => true,
    // Rewrite file URLs to bucket
    'serve-from-s3' => true,
    // Bucket URL format to use ('path', 'cloudfront')
    'domain' => 'cloudfront',
    // Custom domain if 'domain' set to 'cloudfront'
    'cloudfront' => 'cloudfront_domain_here',
    // Enable object prefix, useful if you use your bucket for other files
    'enable-object-prefix' => true,
    // Object prefix to use if 'enable-object-prefix' is 'true'
    'object-prefix' => 'wp-content/uploads/',
    // Organize bucket files into YYYY/MM directories
    'use-yearmonth-folders' => true,
    // Serve files over HTTPS
    'force-https' => false,
    // Remove the local file version once offloaded to bucket
    'remove-local-file' => true,
    // Append a timestamped folder to path of files offloaded to bucket
    'object-versioning' => false,
) ) );

define('FS_METHOD', 'direct' );

// Disable online file modification. Lambda runs in a read-only file system, so
// this just hides options that would result in errors anyway.
define( 'DISALLOW_FILE_MODS', true );

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'put your unique phrase here' );
define( 'SECURE_AUTH_KEY',  'put your unique phrase here' );
define( 'LOGGED_IN_KEY',    'put your unique phrase here' );
define( 'NONCE_KEY',        'put your unique phrase here' );
define( 'AUTH_SALT',        'put your unique phrase here' );
define( 'SECURE_AUTH_SALT', 'put your unique phrase here' );
define( 'LOGGED_IN_SALT',   'put your unique phrase here' );
define( 'NONCE_SALT',       'put your unique phrase here' );

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define( 'WP_DEBUG', false );

define( 'UPLOADS', '../../tmp' );

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', dirname( __FILE__ ) . '/' );
}

/** Sets up WordPress vars and included files. */
require_once( ABSPATH . 'wp-settings.php' );
