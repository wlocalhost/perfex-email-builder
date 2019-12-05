<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>

<?php init_head(); ?>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
<link href="<?php echo module_dir_url(EMAIL_BUILDER_MODULE_NAME, 'assets/' . EMAIL_BUILDER_NGB_FOLDER . '/styles.css') ?>" rel="stylesheet">
<app-root id="wrapper"></app-root>
<script>
    window.GlobalVariable = {
        API_BASE: "<?php echo base_url('/admin/' . EMAIL_BUILDER_MODULE_NAME) ?>",
        MERGE_FIELDS: <?php echo json_encode($available_merge_fields); ?>,
        CSRF: {
            name: "<?php echo $this->security->get_csrf_token_name(); ?>",
            token: "<?php echo $this->security->get_csrf_hash(); ?>"
        }
    }
</script>
<script src="<?php echo module_dir_url(EMAIL_BUILDER_MODULE_NAME, 'assets/' . EMAIL_BUILDER_NGB_FOLDER . '/runtime-es2015.js') ?>" type="module"></script>
<script src="<?php echo module_dir_url(EMAIL_BUILDER_MODULE_NAME, 'assets/' . EMAIL_BUILDER_NGB_FOLDER . '/runtime-es5.js') ?>" nomodule defer></script>
<script src="<?php echo module_dir_url(EMAIL_BUILDER_MODULE_NAME, 'assets/' . EMAIL_BUILDER_NGB_FOLDER . '/polyfills-es2015.js') ?>" type="module"></script>
<script src="<?php echo module_dir_url(EMAIL_BUILDER_MODULE_NAME, 'assets/' . EMAIL_BUILDER_NGB_FOLDER . '/polyfills-es5.js') ?>" nomodule defer></script>
<script src="<?php echo module_dir_url(EMAIL_BUILDER_MODULE_NAME, 'assets/' . EMAIL_BUILDER_NGB_FOLDER . '/vendor-es2015.js') ?>" type="module"></script>
<script src="<?php echo module_dir_url(EMAIL_BUILDER_MODULE_NAME, 'assets/' . EMAIL_BUILDER_NGB_FOLDER . '/vendor-es5.js') ?>" nomodule defer></script>
<script src="<?php echo module_dir_url(EMAIL_BUILDER_MODULE_NAME, 'assets/' . EMAIL_BUILDER_NGB_FOLDER . '/main-es2015.js') ?>" type="module"></script>
<script src="<?php echo module_dir_url(EMAIL_BUILDER_MODULE_NAME, 'assets/' . EMAIL_BUILDER_NGB_FOLDER . '/main-es5.js') ?>" nomodule defer></script>
<?php init_tail(); ?>
</body>
</html>