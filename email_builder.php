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
hooks()->add_filter('module_menu_setup_action_links', 'email_builder_setup_action_links');

function email_builder_init_menu_items() {
    if (has_permission('email_builder', '', 'view')) {
        $CI = &get_instance();
        $CI->app_menu->add_setup_menu_item(EMAIL_BUILDER_MODULE_NAME.'-options', [
            'name'     => _l('email-builder'),
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
    require_once(__DIR__ . '/install.php');
}