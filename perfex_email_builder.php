<?php

defined('BASEPATH') or exit('No direct script access allowed');

/*
Module Name: Perfex Email Builder
Module URI: https://wlocalhost.org/c/perfex-email-builder/23
Author: Ion Prodan
Author URI: https://dev.to/wanoo21
Description: Beautiful e-mail templates, with no design experience needed.
Version: 1.0.0
Requires at least: 2.4.*
*/

define('EMAIL_BUILDER_MODULE_NAME', 'perfex_email_builder');
define('EMAIL_BUILDER_NGB_FOLDER', 'em');

hooks()->add_action('admin_init', 'email_builder_init_menu_items');
hooks()->add_action('before_tickets_email_templates', 'before_tickets_email_templates');
hooks()->add_filter('module_' . EMAIL_BUILDER_MODULE_NAME . '_action_links', 'email_builder_setup_action_links');

// hooks set filter before_parse_email_template_message
hooks()->add_filter('before_parse_email_template_message', 'before_parse_email_template_message');
function before_parse_email_template_message($template) {
    $CI = &get_instance();

    $CI->db->where('emailtemplateid', $template->emailtemplateid);
    $savedTemplate = $CI->db->get(db_prefix() . '_perfex_email_builder')->row();

    if ($savedTemplate) {
        $template->message = html_entity_decode($savedTemplate->template);
        $template->plaintext = 0;
    } else {
        $template->message = get_option('old_email_header') . $template->message . get_option('old_email_footer');
    }

    return $template;
}

// $isModulePage = strpos(base_url(uri_string()), EMAIL_BUILDER_MODULE_NAME);

function perfex_email_builder_head_styles() {
    $builderAssetsPath = module_dir_url(EMAIL_BUILDER_MODULE_NAME, 'assets/' . EMAIL_BUILDER_NGB_FOLDER);

    echo '<base href="' . $builderAssetsPath . '/">' . PHP_EOL;
    echo '<link href="//fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />' . PHP_EOL;
    echo '<link href="' . $builderAssetsPath . '/styles.css" rel="stylesheet">' . PHP_EOL;
}
function perfex_email_builder_footer_scripts() {
    $builderAssetsPath = module_dir_url(EMAIL_BUILDER_MODULE_NAME, 'assets/' . EMAIL_BUILDER_NGB_FOLDER);
    
    echo '<script src="' . $builderAssetsPath . '/runtime-es2015.js" type="module"></script>' . PHP_EOL;
    echo '<script src="' . $builderAssetsPath . '/runtime-es5.js" nomodule defer></script>' . PHP_EOL;
    echo '<script src="' . $builderAssetsPath . '/polyfills-es2015.js" type="module"></script>' . PHP_EOL;
    echo '<script src="' . $builderAssetsPath . '/polyfills-es5.js" nomodule defer></script>' . PHP_EOL;
    echo '<script src="' . $builderAssetsPath . '/vendor-es2015.js" type="module"></script>' . PHP_EOL;
    echo '<script src="' . $builderAssetsPath . '/vendor-es5.js" nomodule defer></script>' . PHP_EOL;
    echo '<script src="' . $builderAssetsPath . '/main-es2015.js" type="module"></script>' . PHP_EOL;
    echo '<script src="' . $builderAssetsPath . '/main-es5.js" nomodule defer></script>' . PHP_EOL;
}

/**
* Register language files, must be registered if the module is using languages
*/
register_language_files(EMAIL_BUILDER_MODULE_NAME, [EMAIL_BUILDER_MODULE_NAME]);

function email_builder_init_menu_items() {
    $CI = &get_instance();
    // $CI->app_scripts->add('email-builder-js', module_dir_url(EMAIL_BUILDER_MODULE_NAME, 'assets/js/simple-fns.js'));

    if (has_permission(EMAIL_BUILDER_MODULE_NAME, '', 'view')) {
        $CI->app_menu->add_setup_menu_item(EMAIL_BUILDER_MODULE_NAME.'-menu', [
            'name'     => _l(EMAIL_BUILDER_MODULE_NAME),
            'collapse' => true,
            // 'permissions' => 'email-templates',
            // 'icon'     => 'fa fa-envelope',
            // 'href'     => admin_url(EMAIL_BUILDER_MODULE_NAME),
            'position' => 35,
        ]);

        $CI->app_menu->add_setup_children_item(EMAIL_BUILDER_MODULE_NAME.'-menu', [
            'slug'     => 'edit_an_email_template', // Required ID/slug UNIQUE for the child menu
            'name'     => _l('edit_an_email_template'), // The name if the item
            'href'     => admin_url(EMAIL_BUILDER_MODULE_NAME), // URL of the item
            // 'position' => 5, // The menu position
            // 'icon'     => 'fa fa-exclamation', // Font awesome icon
        ]);

        $CI->app_menu->add_setup_children_item(EMAIL_BUILDER_MODULE_NAME.'-menu', [
            'slug'     => EMAIL_BUILDER_MODULE_NAME . '_options', // Required ID/slug UNIQUE for the child menu
            'name'     => _l(EMAIL_BUILDER_MODULE_NAME . '_options'), // The name if the item
            'href'     => admin_url(EMAIL_BUILDER_MODULE_NAME . '/options'), // URL of the item
            // 'position' => 5, // The menu position
            // 'icon'     => 'fa fa-exclamation', // Font awesome icon
        ]);
    }
}

function before_tickets_email_templates() {
    echo '<div class="col-md-8 col-md-offset-2 col-xs-12 col-xs-offset-0 text-center"><div class="alert alert-warning">' . _l('email_templates_top_alert') . '</div></div>';
}

/**
* Add additional settings for this module in the module list area
* @param  array $actions current actions
* @return array
*/
function email_builder_setup_action_links($actions) {
    $actions[] = '<a href="' . admin_url(EMAIL_BUILDER_MODULE_NAME) . '">' . _l(EMAIL_BUILDER_MODULE_NAME) . '</a>';
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
    delete_option(EMAIL_BUILDER_MODULE_NAME . '_default_media_folder');
}