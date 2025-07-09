<?php
/**
 * Controller AJAX pour le dashboard
 * Path: modules/mquserdashboard/controllers/front/ajax.php
 */

class MquserdashboardAjaxModuleFrontController extends ModuleFrontController
{
    public function init()
    {
        parent::init();

        // Vérifier que l'utilisateur est connecté
        if (!$this->context->customer->isLogged()) {
            $this->ajaxDie(json_encode([
                'success' => false,
                'message' => 'Vous devez être connecté'
            ]));
        }
    }

    public function displayAjax()
    {
        $action = Tools::getValue('action');

        switch ($action) {
            case 'getCustomerInfo':
                $this->getCustomerInfo();
                break;
            case 'getOrders':
                $this->getOrders();
                break;
            case 'getDashboardData':
                $this->getDashboardData();
                break;
            default:
                $this->ajaxDie(json_encode([
                    'success' => false,
                    'message' => 'Action non reconnue'
                ]));
        }
    }

    /**
     * Récupère les informations du client
     */
    private function getCustomerInfo()
    {
        require_once(_PS_MODULE_DIR_ . 'mquserdashboard/classes/CustomerDashboard.php');

        $customerDashboard = new CustomerDashboard($this->context->customer->id);
        $customerData = $customerDashboard->getCustomerData();

        $this->ajaxDie(json_encode([
            'success' => true,
            'data' => $customerData
        ]));
    }

    /**
     * Récupère les commandes du client
     */
    private function getOrders()
    {
        require_once(_PS_MODULE_DIR_ . 'mquserdashboard/classes/OrderDashboard.php');

        $orderDashboard = new OrderDashboard($this->context->customer->id);
        $orders = $orderDashboard->getCustomerOrders();

        $this->ajaxDie(json_encode([
            'success' => true,
            'data' => $orders
        ]));
    }

    /**
     * Récupère toutes les données du dashboard
     */
    private function getDashboardData()
    {
        require_once(_PS_MODULE_DIR_ . 'mquserdashboard/classes/CustomerDashboard.php');
        require_once(_PS_MODULE_DIR_ . 'mquserdashboard/classes/OrderDashboard.php');

        $customerDashboard = new CustomerDashboard($this->context->customer->id);
        $orderDashboard = new OrderDashboard($this->context->customer->id);

        $data = [
            'customer' => $customerDashboard->getCustomerData(),
            'orders' => $orderDashboard->getCustomerOrders(),
            'stats' => [
                'total_orders' => $orderDashboard->getTotalOrders(),
                'total_spent' => $orderDashboard->getTotalSpent(),
                'last_order_date' => $orderDashboard->getLastOrderDate()
            ]
        ];

        $this->ajaxDie(json_encode([
            'success' => true,
            'data' => $data
        ]));
    }
}