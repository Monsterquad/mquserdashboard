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

        $page = (int)Tools::getValue('page', 1);
        $limit = (int)Tools::getValue('limit', 10);
        $offset = ($page - 1) * $limit;

        $orderDashboard = new OrderDashboard($this->context->customer->id);
        $orders = $orderDashboard->getCustomerOrders($limit, $offset);
        $totalOrders = $orderDashboard->getTotalOrders();

        $this->ajaxDie(json_encode([
            'success' => true,
            'data' => [
                'orders' => $orders,
                'pagination' => [
                    'total' => $totalOrders,
                    'page' => $page,
                    'limit' => $limit,
                    'pages' => ceil($totalOrders / $limit)
                ]
            ]
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

        $recentOrders = $orderDashboard->getCustomerOrders(5, 0);
        $totalOrders = $orderDashboard->getTotalOrders();

        $data = [
            'customer' => $customerDashboard->getCustomerData(),
            'orders' => [
                'orders' => $recentOrders,
                'pagination' => [
                    'total' => $totalOrders,
                    'page' => 1,
                    'limit' => 5,
                    'pages' => ceil($totalOrders / 5)
                ]
            ],
            'stats' => [
                'total_orders' => $totalOrders,
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