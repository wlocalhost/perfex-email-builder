<?php

defined('BASEPATH') or exit('No direct script access allowed');

add_option('old_email_header', get_option('email_header'));
add_option('old_email_footer', get_option('email_footer'));
add_option(EMAIL_BUILDER_MODULE_NAME . '_default_media_folder', EMAIL_BUILDER_MODULE_NAME);
update_option('email_header', '<!-- Handled by Perfex Email Builder, any way you can edit it here: ' . admin_url(EMAIL_BUILDER_MODULE_NAME . '/options') . ' -->');
update_option('email_footer', '<!-- Handled by Perfex Email Builder, any way you can edit it here: ' . admin_url(EMAIL_BUILDER_MODULE_NAME . '/options') . ' -->');

if (!$CI->db->table_exists(db_prefix() . '_perfex_email_builder')) {
    $CI->db->query('CREATE TABLE `' . db_prefix() . '_perfex_email_builder` (
    `id` int(11) NOT NULL,
    `emailtemplateid` VARCHAR(4) NOT NULL,
    `emailObject` TEXT NOT NULL,
    `template` TEXT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT 0,
    `updated_at` TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW()
    ) ENGINE=InnoDB DEFAULT CHARSET='. $CI->db->char_set .';');

    $CI->db->query('ALTER TABLE `' . db_prefix() . '_perfex_email_builder` ADD PRIMARY KEY (`id`);');
    $CI->db->query('ALTER TABLE `' . db_prefix() . '_perfex_email_builder` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1');
}