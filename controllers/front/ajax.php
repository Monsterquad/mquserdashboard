<?php
/**
 * Controller AJAX pour le dashboard - VERSION CORRIGÉE
 * Path: modules/mquserdashboard/controllers/front/ajax.php
 */

class MquserdashboardAjaxModuleFrontController extends ModuleFrontController
{
    public function init()
    {
        parent::init();

        // IMPORTANT: Définir que c'est une requête AJAX
        $this->ajax = true;

        // Désactiver le header et footer pour éviter tout HTML
        header('Content-Type: application/json');
    }

    public function displayAjax()
    {
        // Vérifier que l'utilisateur est connecté
        if (!$this->context->customer->isLogged()) {
            die(json_encode([
                'success' => false,
                'message' => 'Vous devez être connecté'
            ]));
        }

        $action = Tools::getValue('action');

        try {
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
                    die(json_encode([
                        'success' => false,
                        'message' => 'Action non reconnue: ' . $action
                    ]));
            }
        } catch (Exception $e) {
            die(json_encode([
                'success' => false,
                'message' => 'Erreur serveur: ' . $e->getMessage()
            ]));
        }
    }

    /**
     * Récupère les informations du client
     */
    private function getCustomerInfo()
    {
        try {
            require_once(_PS_MODULE_DIR_ . 'mquserdashboard/classes/CustomerDashboard.php');

            $customerDashboard = new CustomerDashboard($this->context->customer->id);
            $customerData = $customerDashboard->getCustomerData();

            die(json_encode([
                'success' => true,
                'data' => $customerData
            ]));
        } catch (Exception $e) {
            die(json_encode([
                'success' => false,
                'message' => 'Erreur lors de la récupération des informations client: ' . $e->getMessage()
            ]));
        }
    }

    /**
     * Récupère les commandes du client
     */
    private function getOrders()
    {
        try {
            require_once(_PS_MODULE_DIR_ . 'mquserdashboard/classes/OrderDashboard.php');

            $page = (int)Tools::getValue('page', 1);
            $limit = (int)Tools::getValue('limit', 10);

            // Validation des paramètres
            if ($page < 1) $page = 1;
            if ($limit < 1 || $limit > 100) $limit = 10;

            $offset = ($page - 1) * $limit;

            $orderDashboard = new OrderDashboard($this->context->customer->id);
            $orders = $orderDashboard->getCustomerOrders($limit, $offset);
            $totalOrders = $orderDashboard->getTotalOrders();

            die(json_encode([
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
        } catch (Exception $e) {
            die(json_encode([
                'success' => false,
                'message' => 'Erreur lors de la récupération des commandes: ' . $e->getMessage()
            ]));
        }
    }

    /**
     * Récupère toutes les données du dashboard
     */
    private function getDashboardData()
    {
        try {
            require_once(_PS_MODULE_DIR_ . 'mquserdashboard/classes/CustomerDashboard.php');
            require_once(_PS_MODULE_DIR_ . 'mquserdashboard/classes/OrderDashboard.php');

            $customerDashboard = new CustomerDashboard($this->context->customer->id);
            $orderDashboard = new OrderDashboard($this->context->customer->id);

            // Récupérer les données client
            $customerData = $customerDashboard->getCustomerData();

            // Récupérer les commandes récentes
            $recentOrders = $orderDashboard->getCustomerOrders(5, 0);
            $totalOrders = $orderDashboard->getTotalOrders();

            $data = [
                'customer' => $customerData,
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

            die(json_encode([
                'success' => true,
                'data' => $data
            ]));
        } catch (Exception $e) {
            die(json_encode([
                'success' => false,
                'message' => 'Erreur lors de la récupération des données: ' . $e->getMessage()
            ]));
        }
    }

    /**
     * Override pour éviter l'affichage du template
     */
    public function display()
    {
        // Ne rien faire - on gère tout dans displayAjax
    }
}