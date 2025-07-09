<?php
/**
 * Module: MqUserDashboard - VERSION CORRIGÉE
 * Description: Dashboard moderne pour les utilisateurs
 * Path: modules/mquserdashboard/mquserdashboard.php
 */

if (!defined('_PS_VERSION_')) {
    exit;
}

class MqUserDashboard extends Module
{
    public function __construct()
    {
        $this->name = 'mquserdashboard';
        $this->tab = 'front_office_features';
        $this->version = '1.0.0';
        $this->author = 'MonsterQuad';
        $this->need_instance = 0;
        $this->ps_versions_compliancy = [
            'min' => '1.7',
            'max' => _PS_VERSION_
        ];
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = $this->l('MQ Dashboard Utilisateur');
        $this->description = $this->l('Dashboard moderne et condensé pour les utilisateurs avec toutes les informations importantes');
        $this->confirmUninstall = $this->l('Êtes-vous sûr de vouloir désinstaller ce module ?');
    }

    public function install()
    {
        return parent::install() &&
        $this->registerHook('displayOverrideTemplate') &&
            $this->registerHook('header') &&
            $this->registerHook('actionFrontControllerSetMedia');
    }

    public function uninstall()
    {
        return parent::uninstall();
    }

    public function hookDisplayHeader($params)
{
    if ($this->context->controller->php_self == 'my-account' ||
        Tools::getValue('controller') == 'dashboard') {

        $this->context->controller->addCSS(
            $this->_path . 'views/css/dashboard.css',
            'all'
        );

        $this->context->controller->addJS(
            $this->_path . 'views/js/dashboard.js'
        );

        Media::addJsDef([
            'mqDashboardAjaxUrl' => $this->context->link->getModuleLink(
                'mquserdashboard',
                'ajax',
                [],
                true
            )
        ]);
    }
}

    public function hookHeader()
    {
        // Ajouter CSS et JS seulement sur les pages account
        if ($this->context->controller instanceof CustomerController ||
            $this->context->controller instanceof MyAccountController) {

            $this->context->controller->registerStylesheet(
                'mquserdashboard-style',
                'modules/' . $this->name . '/views/css/dashboard.css',
                ['media' => 'all', 'priority' => 200]
            );

            $this->context->controller->registerJavascript(
                'mquserdashboard-script',
                'modules/' . $this->name . '/views/js/dashboard.js',
                ['position' => 'bottom', 'priority' => 200]
            );
        }
    }

    public function hookDisplayCustomerAccount($params)
    {
        if (!$this->context->customer->isLogged()) {
            return '';
        }

        try {
            // Récupérer toutes les données nécessaires
            $dashboardData = $this->getDashboardData();

            $this->context->smarty->assign([
                'customer_info' => $dashboardData['customer'],
                'recent_orders' => $dashboardData['orders'],
                'addresses' => $dashboardData['addresses'],
                'vouchers' => $dashboardData['vouchers'],
                'returns' => $dashboardData['returns'],
                'credit_slips' => $dashboardData['credit_slips'],
                'alerts' => $dashboardData['alerts'],
                'stats' => $dashboardData['stats']
            ]);

            return $this->fetch('module:' . $this->name . '/views/templates/dashboard.tpl');
        } catch (Exception $e) {
            // En cas d'erreur, afficher un message simple
            PrestaShopLogger::addLog('MqUserDashboard Error: ' . $e->getMessage(), 3);
            return '<div class="alert alert-warning">Erreur lors du chargement du dashboard</div>';
        }
    }

    private function getDashboardData()
    {
        $customer = $this->context->customer;
        $id_customer = $customer->id;

        return [
            'customer' => $this->getCustomerInfo($customer),
            'orders' => $this->getRecentOrders($id_customer),
            'addresses' => $this->getCustomerAddresses($id_customer),
            'vouchers' => $this->getCustomerVouchers($id_customer),
            'returns' => $this->getCustomerReturns($id_customer),
            'credit_slips' => $this->getCreditSlips($id_customer),
            'alerts' => $this->getProductAlerts($id_customer),
            'stats' => $this->getCustomerStats($id_customer)
        ];
    }

    /**
     * Méthode publique pour l'override du contrôleur
     */
    public function getDashboardDataPublic()
    {
        if (!$this->context->customer->isLogged()) {
            return null;
        }

        return $this->getDashboardData();
    }

    private function getCustomerInfo($customer)
    {
        return [
            'id' => $customer->id,
            'firstname' => $customer->firstname,
            'lastname' => $customer->lastname,
            'email' => $customer->email,
            'birthday' => $customer->birthday,
            'newsletter' => $customer->newsletter,
            'registration_date' => $customer->date_add,
            'last_connection' => $customer->last_passwd_gen
        ];
    }

    private function getRecentOrders($id_customer, $limit = 5)
    {
        try {
            $orders = Order::getCustomerOrders($id_customer);

            $recent_orders = [];
            foreach (array_slice($orders, 0, $limit) as $order) {
                $order_obj = new Order($order['id_order']);

                // Récupération sécurisée du statut
                $currentState = $order_obj->getCurrentStateFull($this->context->language->id);

                // Calcul sécurisé du nombre de produits
                $productsDetail = $order_obj->getProductsDetail();
                $products_count = is_array($productsDetail) ? count($productsDetail) : 0;

                $recent_orders[] = [
                    'id_order' => $order['id_order'],
                    'reference' => $order['reference'],
                    'date_add' => $order['date_add'],
                    'total_paid' => $order['total_paid'],
                    'payment' => $order['payment'],
                    'order_state' => $currentState ? $currentState : ['name' => 'Inconnu', 'color' => 'gray'],
                    'products_count' => $products_count
                ];
            }

            return $recent_orders;
        } catch (Exception $e) {
            PrestaShopLogger::addLog('Error getting recent orders: ' . $e->getMessage(), 3);
            return [];
        }
    }

    private function getCustomerAddresses($id_customer, $limit = 3)
    {
        try {
            // ✅ CORRECTION : Utilisation de la bonne méthode
            $sql = 'SELECT a.*, cl.`name` as country_name
                    FROM `' . _DB_PREFIX_ . 'address` a
                    LEFT JOIN `' . _DB_PREFIX_ . 'country_lang` cl 
                    ON (a.`id_country` = cl.`id_country` AND cl.`id_lang` = ' . (int)$this->context->language->id . ')
                    WHERE a.`id_customer` = ' . (int)$id_customer . '
                    AND a.`deleted` = 0
                    ORDER BY a.`date_add` DESC
                    LIMIT ' . (int)$limit;

            $addresses = Db::getInstance()->executeS($sql);

            if (!$addresses) {
                return [];
            }

            $formatted_addresses = [];
            foreach ($addresses as $address) {
                $formatted_addresses[] = [
                    'id_address' => $address['id_address'],
                    'alias' => $address['alias'],
                    'firstname' => $address['firstname'],
                    'lastname' => $address['lastname'],
                    'address1' => $address['address1'],
                    'address2' => $address['address2'],
                    'postcode' => $address['postcode'],
                    'city' => $address['city'],
                    'country' => $address['country_name'] ? $address['country_name'] : 'N/A',
                    'phone' => $address['phone'],
                    'phone_mobile' => $address['phone_mobile']
                ];
            }

            return $formatted_addresses;
        } catch (Exception $e) {
            PrestaShopLogger::addLog('Error getting customer addresses: ' . $e->getMessage(), 3);
            return [];
        }
    }

    private function getCustomerVouchers($id_customer, $limit = 3)
    {
        try {
            // ✅ CORRECTION : Vérification que la méthode existe
            if (!method_exists('CartRule', 'getCustomerCartRules')) {
                return [];
            }

            $vouchers = CartRule::getCustomerCartRules(
                $this->context->language->id,
                $id_customer,
                true,
                true,
                true,
                null,
                false,
                false
            );

            $active_vouchers = [];
            foreach (array_slice($vouchers, 0, $limit) as $voucher) {
                $active_vouchers[] = [
                    'id_cart_rule' => $voucher['id_cart_rule'],
                    'name' => $voucher['name'],
                    'code' => $voucher['code'],
                    'description' => isset($voucher['description']) ? $voucher['description'] : '',
                    'reduction_amount' => isset($voucher['reduction_amount']) ? $voucher['reduction_amount'] : 0,
                    'reduction_percent' => isset($voucher['reduction_percent']) ? $voucher['reduction_percent'] : 0,
                    'date_from' => $voucher['date_from'],
                    'date_to' => $voucher['date_to'],
                    'minimum_amount' => isset($voucher['minimum_amount']) ? $voucher['minimum_amount'] : 0
                ];
            }

            return $active_vouchers;
        } catch (Exception $e) {
            PrestaShopLogger::addLog('Error getting customer vouchers: ' . $e->getMessage(), 3);
            return [];
        }
    }

    private function getCustomerReturns($id_customer, $limit = 3)
    {
        try {
            $sql = 'SELECT DISTINCT or.*, osl.`name` as state_name
                    FROM `' . _DB_PREFIX_ . 'order_return` or
                    LEFT JOIN `' . _DB_PREFIX_ . 'order_return_state_lang` osl 
                    ON (or.`state` = osl.`id_order_return_state` AND osl.`id_lang` = ' . (int)$this->context->language->id . ')
                    LEFT JOIN `' . _DB_PREFIX_ . 'orders` o ON (or.`id_order` = o.`id_order`)
                    WHERE o.`id_customer` = ' . (int)$id_customer . '
                    ORDER BY or.`date_add` DESC
                    LIMIT ' . (int)$limit;

            $returns = Db::getInstance()->executeS($sql);
            return $returns ? $returns : [];
        } catch (Exception $e) {
            PrestaShopLogger::addLog('Error getting customer returns: ' . $e->getMessage(), 3);
            return [];
        }
    }

    private function getCreditSlips($id_customer, $limit = 3)
    {
        try {
            $sql = 'SELECT os.*, o.`reference` as order_reference
                    FROM `' . _DB_PREFIX_ . 'order_slip` os
                    LEFT JOIN `' . _DB_PREFIX_ . 'orders` o ON (os.`id_order` = o.`id_order`)
                    WHERE o.`id_customer` = ' . (int)$id_customer . '
                    ORDER BY os.`date_add` DESC
                    LIMIT ' . (int)$limit;

            $slips = Db::getInstance()->executeS($sql);
            return $slips ? $slips : [];
        } catch (Exception $e) {
            PrestaShopLogger::addLog('Error getting credit slips: ' . $e->getMessage(), 3);
            return [];
        }
    }

    private function getProductAlerts($id_customer, $limit = 5)
    {
        try {
            if (!Module::isInstalled('ps_emailalerts')) {
                return [];
            }

            $sql = 'SELECT ma.*, pl.`name` as product_name, pl.`link_rewrite`
                    FROM `' . _DB_PREFIX_ . 'mailalert_customer_oos` ma
                    LEFT JOIN `' . _DB_PREFIX_ . 'product_lang` pl 
                    ON (ma.`id_product` = pl.`id_product` AND pl.`id_lang` = ' . (int)$this->context->language->id . ')
                    WHERE ma.`id_customer` = ' . (int)$id_customer . '
                    ORDER BY ma.`id_product` DESC
                    LIMIT ' . (int)$limit;

            $alerts = Db::getInstance()->executeS($sql);
            return $alerts ? $alerts : [];
        } catch (Exception $e) {
            PrestaShopLogger::addLog('Error getting product alerts: ' . $e->getMessage(), 3);
            return [];
        }
    }

    private function getCustomerStats($id_customer)
    {
        try {
            // Statistiques générales
            $total_orders = Order::getCustomerNbOrders($id_customer);

            // ✅ CORRECTION : Utilisation sécurisée pour le total dépensé
            $orders = Order::getCustomerOrders($id_customer);
            $total_spent = 0;
            foreach ($orders as $order) {
                $total_spent += (float)$order['total_paid'];
            }

            // Nombre d'adresses - utilisation de requête SQL directe
            $sql = 'SELECT COUNT(*) FROM `' . _DB_PREFIX_ . 'address` 
                    WHERE `id_customer` = ' . (int)$id_customer . ' AND `deleted` = 0';
            $total_addresses = (int)Db::getInstance()->getValue($sql);

            // Nombre de bons actifs
            $active_vouchers = 0;
            try {
                if (method_exists('CartRule', 'getCustomerCartRules')) {
                    $vouchers = CartRule::getCustomerCartRules(
                        $this->context->language->id,
                        $id_customer,
                        true,
                        true,
                        true
                    );
                    $active_vouchers = is_array($vouchers) ? count($vouchers) : 0;
                }
            } catch (Exception $e) {
                // Ignore l'erreur, garde 0
            }

            // Dernière commande
            $last_order_date = '';
            if (!empty($orders)) {
                $last_order_date = $orders[0]['date_add'];
            }

            return [
                'total_orders' => $total_orders,
                'total_spent' => Tools::displayPrice($total_spent),
                'total_addresses' => $total_addresses,
                'active_vouchers' => $active_vouchers,
                'last_order_date' => $last_order_date,
                'account_age_days' => (int)((time() - strtotime($this->context->customer->date_add)) / 86400)
            ];
        } catch (Exception $e) {
            PrestaShopLogger::addLog('Error getting customer stats: ' . $e->getMessage(), 3);
            return [
                'total_orders' => 0,
                'total_spent' => Tools::displayPrice(0),
                'total_addresses' => 0,
                'active_vouchers' => 0,
                'last_order_date' => '',
                'account_age_days' => 0
            ];
        }
    }

    public function getContent()
    {
        $output = '';

        if (Tools::isSubmit('submit' . $this->name)) {
            Configuration::updateValue('MQUSERDASHBOARD_ACTIVE', Tools::getValue('MQUSERDASHBOARD_ACTIVE'));
            $output .= $this->displayConfirmation($this->l('Paramètres mis à jour'));
        }

        return $output . $this->displayForm();
    }

    public function displayForm()
    {
        $default_lang = (int)Configuration::get('PS_LANG_DEFAULT');

        $fields_form[0]['form'] = [
            'legend' => [
                'title' => $this->l('Configuration Dashboard'),
            ],
            'input' => [
                [
                    'type' => 'switch',
                    'label' => $this->l('Activer le dashboard'),
                    'name' => 'MQUSERDASHBOARD_ACTIVE',
                    'is_bool' => true,
                    'desc' => $this->l('Active ou désactive l\'affichage du dashboard'),
                    'values' => [
                        [
                            'id' => 'active_on',
                            'value' => true,
                            'label' => $this->l('Activé')
                        ],
                        [
                            'id' => 'active_off',
                            'value' => false,
                            'label' => $this->l('Désactivé')
                        ]
                    ],
                ],
            ],
            'submit' => [
                'title' => $this->l('Enregistrer'),
                'class' => 'btn btn-default pull-right'
            ]
        ];

        $helper = new HelperForm();
        $helper->module = $this;
        $helper->name_controller = $this->name;
        $helper->token = Tools::getAdminTokenLite('AdminModules');
        $helper->currentIndex = AdminController::$currentIndex . '&configure=' . $this->name;
        $helper->default_form_language = $default_lang;
        $helper->allow_employee_form_lang = $default_lang;
        $helper->title = $this->displayName;
        $helper->show_toolbar = true;
        $helper->toolbar_scroll = true;
        $helper->submit_action = 'submit' . $this->name;

        $helper->fields_value['MQUSERDASHBOARD_ACTIVE'] = Configuration::get('MQUSERDASHBOARD_ACTIVE', true);

        return $helper->generateForm($fields_form);
    }
}