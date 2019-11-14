<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>
<?php init_head(); ?>
<?php foreach($css_files as $style) { ?>
   <link rel="stylesheet" href="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/'.basename($style)) ?>">
<?php } ?>
<div id="wrapper">
   <div class="content">
      <div class="row">
         <div class="col-md-12">
            <app-root></app-root>
         </div>
      </div>
   </div>
</div>
<?php usort($js_files, function($a) {
   return preg_match('/polyfills|runtime/', basename($a)) ? 0 : 1;
}); ?>
<?php foreach($js_files as $js) { 
   $filename = basename($js);
?>
   <script 
      type="text/javascript" 
      src="<?php echo module_dir_url('email_builder', 'assets/perfex-email-builder/'.basename($filename)) ?>" <?php if (preg_match('/es2015-polyfills/', $filename)) echo "nomodule"; ?>></script>
<?php } ?>
<?php init_tail(); ?>
</body>
</html>