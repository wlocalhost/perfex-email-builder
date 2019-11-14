<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>
<?php init_head(); ?>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
<link rel="stylesheet" href="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/styles.css') ?>">
<app-root id="wrapper"></app-root>
<script src="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/runtime-es2015.js') ?>" type="module"></script>
<script src="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/runtime-es5.js') ?>" nomodule defer></script>
<script src="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/polyfills-es5.js') ?>" nomodule defer></script>
<script src="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/polyfills-es2015.js') ?>" type="module"></script>
<script src="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/main-es2015.js') ?>" type="module"></script>
<script src="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/main-es5.js') ?>" nomodule defer></script>
<?php init_tail(); ?>
</body>
</html>