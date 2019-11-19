<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>
<?php init_head(); ?>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
<link href="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/styles.css') ?>" rel="stylesheet">
<app-root id="wrapper"></app-root>
<script>
    window.GlobalVariable = {
        API_BASE: "<?php echo base_url('/admin/email_builder') ?>",
        MERGE_FIELDS: <?php echo json_encode($available_merge_fields); ?>,
        CSRF: "<?php echo $this->security->get_csrf_hash(); ?>"
    }
</script>
<script src="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/runtime-es2015.js') ?>" type="module"></script>
<script src="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/runtime-es5.js') ?>" nomodule defer></script>
<script src="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/polyfills-es2015.js') ?>" type="module"></script>
<script src="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/polyfills-es5.js') ?>" nomodule defer></script>
<script src="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/vendor-es2015.js') ?>" type="module"></script>
<script src="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/vendor-es5.js') ?>" nomodule defer></script>
<script src="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/main-es2015.js') ?>" type="module"></script>
<script src="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/main-es5.js') ?>" nomodule defer></script>
<?php init_tail(); ?>
</body>
</html>