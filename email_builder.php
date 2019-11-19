<?php

defined('BASEPATH') or exit('No direct script access allowed');

/*
Module Name: Perfex Email Builder
Description: Create beautiful and fully-responsive email templates
Version: 1.0.0
Requires at least: 2.3.*
*/

define('EMAIL_BUILDER_MODULE_NAME', 'email_builder');

$CI = &get_instance();

hooks()->add_action('admin_init', 'email_builder_init_menu_items');
hooks()->add_filter('module_email_builder_action_links', 'email_builder_setup_action_links');

function email_builder_init_menu_items() {
    if (has_permission('email_builder', '', 'view')) {
        $CI = &get_instance();
        $CI->app_menu->add_setup_menu_item(EMAIL_BUILDER_MODULE_NAME.'-options', [
            'name'     => _l('email-builder'),
            'permissions' => 'email-templates',
            'icon'     => 'fa fa-envelope',
            'href'     => admin_url(EMAIL_BUILDER_MODULE_NAME),
            'position' => 30,
        ]);
    }
}

/**
* Add additional settings for this module in the module list area
* @param  array $actions current actions
* @return array
*/
function email_builder_setup_action_links($actions)
{
    $actions[] = '<a href="' . admin_url('email_builder') . '">' . _l('email_builder') . '</a>';
    // $actions[] = '<a href="' . admin_url('menu_setup/setup_menu') . '">' . _l('setup_menu') . '</a>';

    return $actions;
}

/**
* Register activation module hook
*/
register_activation_hook(EMAIL_BUILDER_MODULE_NAME, 'email_builder_activation_hook');

function email_builder_activation_hook()
{
    $CI = &get_instance();
    require_once(__DIR__ . '/install.php');
}

/**
 * Return old options on uninstall
 */
register_deactivation_hook(EMAIL_BUILDER_MODULE_NAME, 'email_builder_deactivation_hook');
function email_builder_deactivation_hook()
{
    update_option('email_header', get_option('old_email_header'));
    update_option('email_footer', get_option('old_email_footer'));
}

/**
 * Delete all email builder options on uninstall
 */
register_uninstall_hook(EMAIL_BUILDER_MODULE_NAME, 'email_builder_uninstall_hook');
function email_builder_uninstall_hook()
{
    delete_option('old_email_header');
    delete_option('old_email_footer');
    delete_option('direct_links_from_email_templates_page');
}