<?php

defined('BASEPATH') or exit('No direct script access allowed');

// add_option('direct_links_from_email_templates_page', 'true');
add_option('old_email_header', get_option('email_header'));
add_option('old_email_footer', get_option('email_footer'));
update_option('email_header', '<!-- Handled by Email Builder, do not add anything here! -->');
update_option('email_footer', '<!-- Handled by Email Builder, do not add anything here! -->');

if (!$CI->db->table_exists(db_prefix() . 'perfexemailbuilder')) {
    $CI->db->query('CREATE TABLE `' . db_prefix() . 'perfexemailbuilder` (
    `id` int(11) NOT NULL,
    `emailtemplateid` VARCHAR(4) NOT NULL,
    `emailObject` JSON NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT NOW(),
    `updated_at` TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW()
    ) ENGINE=InnoDB DEFAULT CHARSET='. $CI->db->char_set .';');

    $CI->db->query('ALTER TABLE `' . db_prefix() . 'perfexemailbuilder` ADD PRIMARY KEY (`id`);');
    $CI->db->query('ALTER TABLE `' . db_prefix() . 'perfexemailbuilder` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1');
}