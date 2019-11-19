<?php

defined('BASEPATH') or exit('No direct script access allowed');

/*
Module Name: Perfex Email Builder
Description: Create beautiful and fully-responsive email templates
Version: 1.0.0
Requires at least: 2.3.*
*/

define('EMAIL_BUILDER_MODULE_NAME', 'email_builder');

hooks()->add_action('admin_init', 'email_builder_init_menu_items');
hooks()->add_action('before_tickets_email_templates', 'before_tickets_email_templates');
hooks()->add_filter('module_email_builder_action_links', 'email_builder_setup_action_links');

// hooks set filter before_parse_email_template_message
hooks()->add_filter('before_parse_email_template_message', 'before_parse_email_template_message');
function before_parse_email_template_message($template) {
    $CI = &get_instance();

    $CI->db->where('emailtemplateid', $template->emailtemplateid);
    $savedTemplate = $CI->db->get(db_prefix() . 'perfexemailbuilder')->row();

    if ($savedTemplate) {
        $template->message = html_entity_decode($savedTemplate->template);
        $template->plaintext = 0;
    } else {
        $template->message = get_option('old_email_header') . $template->message . get_option('old_email_footer');
    }

    return $template;
}

function email_builder_init_menu_items() {
    if (has_permission('email_builder', '', 'view')) {
        $CI = &get_instance();
        $CI->app_menu->add_setup_menu_item(EMAIL_BUILDER_MODULE_NAME.'-options', [
            'name'     => _l('email-builder'),
            // 'permissions' => 'email-templates',
            // 'icon'     => 'fa fa-envelope',
            'href'     => admin_url(EMAIL_BUILDER_MODULE_NAME),
            'position' => 35,
        ]);
    }
}

function before_tickets_email_templates() {
    return '<p>Edit into email builder</p>';
}

/**
* Add additional settings for this module in the module list area
* @param  array $actions current actions
* @return array
*/
function email_builder_setup_action_links($actions) {
    $actions[] = '<a href="' . admin_url('email_builder') . '">' . _l('email_builder') . '</a>';
    return $actions;
}

/**
* Register activation module hook
*/
register_activation_hook(EMAIL_BUILDER_MODULE_NAME, 'email_builder_activation_hook');

function email_builder_activation_hook() {
    $CI = &get_instance();
    require_once(__DIR__ . '/install.php');
}

/**
 * Return old options on uninstall
 */
register_deactivation_hook(EMAIL_BUILDER_MODULE_NAME, 'email_builder_deactivation_hook');
function email_builder_deactivation_hook() {
    update_option('email_header', get_option('old_email_header'));
    update_option('email_footer', get_option('old_email_footer'));
}

/**
 * Delete all email builder options on uninstall
 */
register_uninstall_hook(EMAIL_BUILDER_MODULE_NAME, 'email_builder_uninstall_hook');
function email_builder_uninstall_hook() {
    delete_option('old_email_header');
    delete_option('old_email_footer');
    delete_option('direct_links_from_email_templates_page');
}