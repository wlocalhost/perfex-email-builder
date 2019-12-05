<?php

defined('BASEPATH') or exit('No direct script access allowed');

/*
Module Name: Perfex Email Builder
Module URI: https://help.perfexcrm.com
Author: Ion Prodan
Author URI: https://dev.to/wanoo21
Description: Create beautiful and fully-responsive email templates
Version: 1.0.0
Requires at least: 2.4.*
*/

define('EMAIL_BUILDER_MODULE_NAME', 'email_builder');

hooks()->add_action('admin_init', 'email_builder_init_menu_items');
hooks()->add_action('app_admin_head', 'theme_scripts_admin_head');
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

function theme_scripts_admin_head() {
    // echo '<base href="'.module_dir_url('email_builder', 'assets/perfex-email-builder/').'">' . PHP_EOL;
}

function email_builder_init_menu_items() {
    $CI = &get_instance();
    $CI->app_scripts->add('email-builder-js', module_dir_url(EMAIL_BUILDER_MODULE_NAME, 'assets/js/simple-fns.js'));

    if (has_permission('email_builder', '', 'view')) {
        $CI->app_menu->add_setup_menu_item(EMAIL_BUILDER_MODULE_NAME.'-menu', [
            'name'     => _l('email-builder'),
            'collapse' => true,
            // 'permissions' => 'email-templates',
            // 'icon'     => 'fa fa-envelope',
            // 'href'     => admin_url(EMAIL_BUILDER_MODULE_NAME),
            'position' => 35,
        ]);

        $CI->app_menu->add_setup_children_item(EMAIL_BUILDER_MODULE_NAME.'-menu', [
            'slug'     => 'email-builder.start', // Required ID/slug UNIQUE for the child menu
            'name'     => _l('email-builder.start'), // The name if the item
            'href'     => admin_url(EMAIL_BUILDER_MODULE_NAME), // URL of the item
            // 'position' => 5, // The menu position
            // 'icon'     => 'fa fa-exclamation', // Font awesome icon
        ]);

        $CI->app_menu->add_setup_children_item(EMAIL_BUILDER_MODULE_NAME.'-menu', [
            'slug'     => 'email-builder.settings', // Required ID/slug UNIQUE for the child menu
            'name'     => _l('email-builder.settings'), // The name if the item
            'href'     => admin_url(EMAIL_BUILDER_MODULE_NAME . '/settings'), // URL of the item
            // 'position' => 5, // The menu position
            // 'icon'     => 'fa fa-exclamation', // Font awesome icon
        ]);
    }
}

function before_tickets_email_templates() {
    echo '<div class="col-md-6 col-md-offset-3 col-xs-12 col-xs-offset-0"><div class="alert alert-warning">Edit into email builder</div></div>';
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