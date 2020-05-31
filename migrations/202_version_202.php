<?php

defined('BASEPATH') or exit('No direct script access allowed');

class Migration_Version_202 extends App_module_migration
{
    public function __construct()
    {
        parent::__construct();
    }

    public function up()
    {
    	$CI = &get_instance();
    	if (!$CI->db->table_exists(db_prefix() . '_perfex_email_builder_widgets')) {
		    $CI->db->query('CREATE TABLE `' . db_prefix() . '_perfex_email_builder_widgets` (
		    `id` int(11) NOT NULL,
		    `name` varchar(255) DEFAULT NULL,
		    `module` longtext,
		    `created_at` TIMESTAMP NOT NULL DEFAULT 0,
		    `updated_at` TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW()
		    ) ENGINE=InnoDB DEFAULT CHARSET='. $CI->db->char_set .';');

		    $CI->db->query('ALTER TABLE `' . db_prefix() . '_perfex_email_builder_widgets` ADD PRIMARY KEY (`id`);');
		    $CI->db->query('ALTER TABLE `' . db_prefix() . '_perfex_email_builder_widgets` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1');
		}
    }
}
