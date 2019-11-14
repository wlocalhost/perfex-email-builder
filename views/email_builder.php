<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>
<?php init_head(); ?>
<?php foreach($css_files as $style) { ?>
   <link rel="stylesheet" href="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/'.basename($style)) ?>">
<?php } ?>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
<app-root id="wrapper"></app-root>
<script src="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/runtime-es2015.edb2fcf2778e7bf1d426.js') ?>" type="module"></script>
<script src="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/runtime-es5.edb2fcf2778e7bf1d426.js') ?>" nomodule defer></script>
<script src="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/polyfills-es5.fefa72e12b2a2d6ef7f2.js') ?>" nomodule defer></script>
<script src="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/polyfills-es2015.2987770fde9daa1d8a2e.js') ?>" type="module"></script>
<script src="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/main-es2015.7496a45fd79e0f903cc2.js') ?>" type="module"></script>
<script src="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/main-es5.7496a45fd79e0f903cc2.js') ?>" nomodule defer></script>
<?php init_tail(); ?>
</body>
</html>