<?php defined('BASEPATH') or exit('No direct script access allowed'); ?>
<?php init_head(); ?>
<div id="wrapper">
    <div class="content">
        <div class="panel_s">
            <div class="panel-body">
                <?php hooks()->do_action('before_options_perfex_email_builder'); ?>
                <h1><?php echo $title ?></h1>
            </div>
        </div>
    </div>
</div>
<?php init_tail(); ?>
</body>
</html>