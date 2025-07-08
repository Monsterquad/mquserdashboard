<?php
/**
 * Override du contrôleur MyAccount
 * Path: override/controllers/front/MyAccountController.php
 */

class MyAccountController extends MyAccountControllerCore
{
    public function initContent()
    {
        // Vérifier si le module dashboard est activé
        if (Module::isInstalled('mquserdashboard') && Module::isEnabled('mquserdashboard')) {
            $mqDashboard = Module::getInstanceByName('mquserdashboard');

            if ($mqDashboard && Configuration::get('MQUSERDASHBOARD_ACTIVE', true)) {
                // Utiliser uniquement le dashboard
                $this->setTemplate('module:mquserdashboard/views/templates/my-account-dashboard.tpl');

                // Récupérer les données du dashboard
                $dashboardData = $mqDashboard->getDashboardDataPublic();

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

                // Ajouter les CSS et JS
                $this->registerStylesheet(
                    'mquserdashboard-style',
                    'modules/mquserdashboard/views/css/dashboard.css',
                    ['media' => 'all', 'priority' => 200]
                );

                $this->registerJavascript(
                    'mquserdashboard-script',
                    'modules/mquserdashboard/views/js/dashboard.js',
                    ['position' => 'bottom', 'priority' => 200]
                );

                return;
            }
        }

        // Fallback vers le comportement original
        parent::initContent();
    }
}