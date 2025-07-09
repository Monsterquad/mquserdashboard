<?php
/**
 * Classe pour gérer les commandes du dashboard
 * Path: modules/mquserdashboard/classes/OrderDashboard.php
 */

class OrderDashboard
{
    private $customerId;
    private $context;

    public function __construct($customerId)
    {
        $this->customerId = (int)$customerId;
        $this->context = Context::getContext();
    }

    /**
     * Récupère les commandes du client
     */
    public function getCustomerOrders($limit = null, $offset = 0)
    {
        // Construction de la requête SQL pour la pagination
        $sql = 'SELECT o.*, osl.name as order_state_name, c.iso_code as currency_iso_code
                FROM ' . _DB_PREFIX_ . 'orders o
                LEFT JOIN ' . _DB_PREFIX_ . 'order_state_lang osl 
                    ON (o.current_state = osl.id_order_state AND osl.id_lang = ' . (int)$this->context->language->id . ')
                LEFT JOIN ' . _DB_PREFIX_ . 'currency c ON (o.id_currency = c.id_currency)
                WHERE o.id_customer = ' . (int)$this->customerId . '
                AND o.valid = 1
                ORDER BY o.date_add DESC';

        if ($limit !== null) {
            $sql .= ' LIMIT ' . (int)$limit . ' OFFSET ' . (int)$offset;
        }

        $orders = Db::getInstance()->executeS($sql);
        $formattedOrders = [];

        foreach ($orders as $order) {
            $orderObj = new Order($order['id_order']);
            $carrier = new Carrier($orderObj->id_carrier, $this->context->language->id);

            $formattedOrders[] = [
                'id' => $order['id_order'],
                'reference' => $order['reference'],
                'date_add' => $order['date_add'],
                'payment' => $order['payment'],
                'total_paid' => Tools::displayPrice($order['total_paid'], new Currency($order['id_currency'])),
                'total_paid_value' => $order['total_paid'],
                'status' => [
                    'id' => $order['current_state'],
                    'name' => $order['order_state_name'],
                    'color' => $this->getOrderStateColor($order['current_state'])
                ],
                'invoice_number' => $order['invoice_number'],
                'delivery_number' => $order['delivery_number'],
                'nb_products' => $this->getOrderProductsCount($order['id_order']),
                'carrier' => [
                    'id' => $carrier->id,
                    'name' => $carrier->name
                ],
                'tracking_number' => $this->getTrackingNumber($order['id_order'])
            ];
        }

        return $formattedOrders;
    }

    /**
     * Récupère les produits d'une commande
     */
    public function getOrderProducts($orderId)
    {
        $order = new Order($orderId);
        $products = $order->getProducts();
        $formattedProducts = [];

        foreach ($products as $product) {
            $formattedProducts[] = [
                'id' => $product['product_id'],
                'name' => $product['product_name'],
                'reference' => $product['product_reference'],
                'quantity' => $product['product_quantity'],
                'price' => Tools::displayPrice($product['product_price_wt']),
                'total' => Tools::displayPrice($product['total_wt']),
                'image' => $this->getProductImage($product['product_id'], $product['product_attribute_id'])
            ];
        }

        return $formattedProducts;
    }

    /**
     * Récupère l'image du produit
     */
    private function getProductImage($productId, $productAttributeId = 0)
    {
        $product = new Product($productId);
        $image = Product::getCover($productId);

        if ($image) {
            return $this->context->link->getImageLink(
                $product->link_rewrite[$this->context->language->id],
                $image['id_image'],
                'small_default'
            );
        }

        return '';
    }

    /**
     * Récupère le nombre de produits dans une commande
     */
    private function getOrderProductsCount($orderId)
    {
        $sql = 'SELECT SUM(product_quantity) 
                FROM ' . _DB_PREFIX_ . 'order_detail 
                WHERE id_order = ' . (int)$orderId;

        return (int)Db::getInstance()->getValue($sql);
    }

    /**
     * Récupère le nom de l'état de commande
     */
    private function getOrderStateName($stateId)
    {
        $orderState = new OrderState($stateId, $this->context->language->id);
        return $orderState->name;
    }

    /**
     * Récupère la couleur de l'état de commande
     */
    private function getOrderStateColor($stateId)
    {
        $orderState = new OrderState($stateId);
        return $orderState->color;
    }

    /**
     * Récupère le numéro de suivi
     */
    private function getTrackingNumber($orderId)
    {
        $order = new Order($orderId);
        $carrier = new Carrier($order->id_carrier);

        if ($order->shipping_number) {
            return [
                'number' => $order->shipping_number,
                'url' => str_replace('@', $order->shipping_number, $carrier->url)
            ];
        }

        return null;
    }

    /**
     * Récupère le total des commandes
     */
    public function getTotalOrders()
    {
        $sql = 'SELECT COUNT(*) 
                FROM ' . _DB_PREFIX_ . 'orders 
                WHERE id_customer = ' . (int)$this->customerId . ' 
                AND valid = 1';

        return (int)Db::getInstance()->getValue($sql);
    }

    /**
     * Récupère le montant total dépensé
     */
    public function getTotalSpent()
    {
        $sql = 'SELECT SUM(total_paid_real) 
                FROM ' . _DB_PREFIX_ . 'orders 
                WHERE id_customer = ' . (int)$this->customerId . ' 
                AND valid = 1';

        $total = Db::getInstance()->getValue($sql);
        return Tools::displayPrice($total);
    }

    /**
     * Récupère la date de la dernière commande
     */
    public function getLastOrderDate()
    {
        $sql = 'SELECT date_add 
                FROM ' . _DB_PREFIX_ . 'orders 
                WHERE id_customer = ' . (int)$this->customerId . ' 
                AND valid = 1 
                ORDER BY date_add DESC 
                LIMIT 1';

        return Db::getInstance()->getValue($sql);
    }

    /**
     * Récupère les statistiques des commandes par état
     */
    public function getOrdersStatsByState()
    {
        $sql = 'SELECT os.name, COUNT(o.id_order) as count, os.color
                FROM ' . _DB_PREFIX_ . 'orders o
                LEFT JOIN ' . _DB_PREFIX_ . 'order_state_lang os 
                    ON o.current_state = os.id_order_state 
                    AND os.id_lang = ' . (int)$this->context->language->id . '
                WHERE o.id_customer = ' . (int)$this->customerId . '
                GROUP BY o.current_state';

        return Db::getInstance()->executeS($sql);
    }
}