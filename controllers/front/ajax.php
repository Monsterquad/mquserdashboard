<?php
/**
 * Controller AJAX pour le dashboard - VERSION CORRIGÉE
 * Path: modules/mquserdashboard/controllers/front/ajax.php
 */


require_once _PS_MODULE_DIR_ . 'mquserdashboard/classes/CustomerSupportManager.php';
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
                // pour les customer infos
                case 'getCustomerInfo':
                    $this->getCustomerInfo();
                    break;
                case 'updateCustomerInfo':
                    $this->updateCustomerInfo();
                    break;
                // pour les address
                case 'addCustomerAddress':
                    $this->addCustomerAddress();
                    break;
                case 'updateCustomerAddress':
                    $this->updateCustomerAddress();
                    break;
                // pour les commandes du clients
                case 'getOrders':
                    $this->getOrders();
                    break;
                // pour les bons de réductions et avoirs
                case 'getCustomerCredits':
                    $this->getCustomerVouchers();
                    break;
                // pour les avis
                case 'getCustomerReviews':
                    $this->getCustomerReviews();
                    break;
                case 'addCustomerReview':
                    $this->addCustomerReview();
                    break;
                case 'getCustomerThreads':
                    $this->getCustomerThreads();
                    break;
                case 'getThreadMessages':
                    $this->getThreadMessages();
                    break;
                case 'addThreadMessage':
                    $this->addMessageToThread();
                    break;
                case 'createNewThread':
                    $this->createNewThread();
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
    * Met à jour les informations du profil client
    */
    private function updateCustomerInfo()
    {
       try {
           $customer = new Customer($this->context->customer->id);

           if (!Validate::isLoadedObject($customer)) {
               throw new Exception('Client non trouvé');
           }

           // Récupérer et valider les données
           $firstname = Tools::getValue('firstname');
           $lastname = Tools::getValue('lastname');
           $email = Tools::getValue('email');
           $gender = Tools::getValue('gender');
           $birthday = Tools::getValue('birthday');
           $newsletter = (bool)Tools::getValue('newsletter');
           $optin = (bool)Tools::getValue('optin');

           // Validations
           if (!Validate::isName($firstname)) {
               throw new Exception('Prénom invalide');
           }
           if (!Validate::isName($lastname)) {
               throw new Exception('Nom invalide');
           }
           if (!Validate::isEmail($email)) {
               throw new Exception('Email invalide');
           }
           if ($gender && !in_array($gender, ['M', 'F'])) {
               throw new Exception('Civilité invalide');
           }

           // Mettre à jour les données
           $customer->firstname = $firstname;
           $customer->lastname = $lastname;
           $customer->email = $email;
           if ($gender) $customer->id_gender = ($gender === 'M') ? 1 : 2;
           if ($birthday && $birthday !== '0000-00-00') {
               $customer->birthday = $birthday;
           }
           $customer->newsletter = $newsletter;
           $customer->optin = $optin;

           if (!$customer->save()) {
               throw new Exception('Erreur lors de la sauvegarde');
           }

           die(json_encode([
               'success' => true,
               'message' => 'Profil mis à jour avec succès',
               'data' => [
                   'firstname' => $customer->firstname,
                   'lastname' => $customer->lastname,
                   'email' => $customer->email,
                   'gender' => $gender,
                   'birthday' => $customer->birthday,
                   'newsletter' => $customer->newsletter,
                   'optin' => $customer->optin
               ]
           ]));
       } catch (Exception $e) {
           die(json_encode([
               'success' => false,
               'message' => 'Erreur lors de la mise à jour: ' . $e->getMessage()
           ]));
       }
    }

    /**
    * Ajoute une nouvelle adresse client
    */
    private function addCustomerAddress()
    {
       try {
           $address = new Address();
           $address->id_customer = $this->context->customer->id;
           $address->id_country = Country::getByIso(Tools::getValue('country', 'FR'));

           // Récupérer et valider les données
           $address->alias = Tools::getValue('alias');
           $address->firstname = Tools::getValue('firstname');
           $address->lastname = Tools::getValue('lastname');
           $address->company = Tools::getValue('company', '');
           $address->address1 = Tools::getValue('address1');
           $address->address2 = Tools::getValue('address2', '');
           $address->postcode = Tools::getValue('postcode');
           $address->city = Tools::getValue('city');
           $address->phone = Tools::getValue('phone', '');
           $address->phone_mobile = Tools::getValue('phone_mobile', '');

           // Validations
           if (!Validate::isGenericName($address->alias)) {
               throw new Exception('Alias invalide');
           }
           if (!Validate::isName($address->firstname)) {
               throw new Exception('Prénom invalide');
           }
           if (!Validate::isName($address->lastname)) {
               throw new Exception('Nom invalide');
           }
           if (!Validate::isAddress($address->address1)) {
               throw new Exception('Adresse invalide');
           }
           if (!Validate::isPostCode($address->postcode)) {
               throw new Exception('Code postal invalide');
           }
           if (!Validate::isCityName($address->city)) {
               throw new Exception('Ville invalide');
           }

           if (!$address->save()) {
               throw new Exception('Erreur lors de la sauvegarde de l\'adresse');
           }

           die(json_encode([
               'success' => true,
               'message' => 'Adresse ajoutée avec succès',
               'data' => [
                   'id' => $address->id,
                   'alias' => $address->alias,
                   'firstname' => $address->firstname,
                   'lastname' => $address->lastname,
                   'company' => $address->company,
                   'address1' => $address->address1,
                   'address2' => $address->address2,
                   'postcode' => $address->postcode,
                   'city' => $address->city,
                   'country' => Country::getNameById($this->context->language->id, $address->id_country),
                   'phone' => $address->phone,
                   'phone_mobile' => $address->phone_mobile,
                   'is_default' => false
               ]
           ]));
       } catch (Exception $e) {
           die(json_encode([
               'success' => false,
               'message' => 'Erreur lors de l\'ajout: ' . $e->getMessage()
           ]));
       }
    }

    /**
    * Met à jour une adresse existante
    */
    private function updateCustomerAddress()
    {
       try {
           $addressId = (int)Tools::getValue('id');
           $address = new Address($addressId);

           if (!Validate::isLoadedObject($address) || $address->id_customer != $this->context->customer->id) {
               throw new Exception('Adresse non trouvée');
           }

           // Mettre à jour les données
           $address->alias = Tools::getValue('alias');
           $address->firstname = Tools::getValue('firstname');
           $address->lastname = Tools::getValue('lastname');
           $address->company = Tools::getValue('company', '');
           $address->address1 = Tools::getValue('address1');
           $address->address2 = Tools::getValue('address2', '');
           $address->postcode = Tools::getValue('postcode');
           $address->city = Tools::getValue('city');
           $address->phone = Tools::getValue('phone', '');
           $address->phone_mobile = Tools::getValue('phone_mobile', '');
           $address->id_country = Country::getByIso(Tools::getValue('country', 'FR'));

           // Validations
           if (!Validate::isGenericName($address->alias)) {
               throw new Exception('Alias invalide');
           }
           if (!Validate::isName($address->firstname)) {
               throw new Exception('Prénom invalide');
           }
           if (!Validate::isName($address->lastname)) {
               throw new Exception('Nom invalide');
           }

           if (!$address->save()) {
               throw new Exception('Erreur lors de la sauvegarde');
           }

           die(json_encode([
               'success' => true,
               'message' => 'Adresse mise à jour avec succès',
               'data' => [
                   'id' => $address->id,
                   'alias' => $address->alias,
                   'firstname' => $address->firstname,
                   'lastname' => $address->lastname,
                   'company' => $address->company,
                   'address1' => $address->address1,
                   'address2' => $address->address2,
                   'postcode' => $address->postcode,
                   'city' => $address->city,
                   'country' => Country::getNameById($this->context->language->id, $address->id_country),
                   'phone' => $address->phone,
                   'phone_mobile' => $address->phone_mobile,
                   'is_default' => false
               ]
           ]));
       } catch (Exception $e) {
           die(json_encode([
               'success' => false,
               'message' => 'Erreur lors de la modification: ' . $e->getMessage()
           ]));
       }
    }



    /**
    * Récupère les avis du client
    */
    private function getCustomerReviews()
    {
       try {
           $customerId = $this->context->customer->id;

           $sql = 'SELECT pc.*, p.reference, pl.name as product_name
                   FROM ' . _DB_PREFIX_ . 'lgcomments_productcomments pc
                   LEFT JOIN ' . _DB_PREFIX_ . 'product p ON pc.id_product = p.id_product
                   LEFT JOIN ' . _DB_PREFIX_ . 'product_lang pl ON (p.id_product = pl.id_product AND pl.id_lang = ' . (int)$this->context->language->id . ')
                   WHERE pc.id_customer = ' . (int)$customerId . '
                   ORDER BY pc.date DESC';

           $reviews = Db::getInstance()->executeS($sql);

           $formattedReviews = [];
           foreach ($reviews as $review) {
               $formattedReviews[] = [
                   'id' => $review['id_productcomment'],
                   'id_product' => $review['id_product'],
                   'product_name' => $review['product_name'],
                   'product_reference' => $review['reference'],
                   'title' => $review['title'],
                   'comment' => $review['comment'],
                   'stars' => $review['stars'],
                   'date' => $review['date'],
                   'active' => $review['active'],
               ];
           }

           $Reviews['reviews'] =  $formattedReviews;
           $Reviews["orders_data"] = $this->getLastOrders($customerId);

           die(json_encode([
               'success' => true,
               'data' => $Reviews
           ]));
       } catch (Exception $e) {
           die(json_encode([
               'success' => false,
               'message' => 'Erreur lors de la récupération des avis: ' . $e->getMessage()
           ]));
       }
    }

    /**
    * Enregistre un nouvel avis client
    */
    private function addCustomerReview()
    {
       try {
           $customerId = $this->context->customer->id;
           $productId = (int)Tools::getValue('id_product');
           $title = Tools::getValue('title');
           $comment = Tools::getValue('comment');
           $stars = (int)Tools::getValue('stars');

           // Validations
           if (!$productId) {
               throw new Exception('Produit non spécifié');
           }
           if (!Validate::isGenericName($title)) {
               throw new Exception('Titre invalide');
           }
           if (!Validate::isMessage($comment)) {
               throw new Exception('Commentaire invalide');
           }
           if ($stars < 1 || $stars > 5) {
               throw new Exception('Note invalide (1-5 étoiles)');
           }

           // Vérifier que le produit existe
           $product = new Product($productId);
           if (!Validate::isLoadedObject($product)) {
               throw new Exception('Produit non trouvé');
           }

           // Insérer l'avis
           $sql = 'INSERT INTO ' . _DB_PREFIX_ . 'lgcomments_productcomments 
                   (id_product, id_customer, id_lang, title, comment, stars, date, active, position)
                   VALUES (
                       ' . (int)$productId . ',
                       ' . (int)$customerId . ',
                       ' . (int)$this->context->language->id . ',
                       "' . pSQL($title) . '",
                       "' . pSQL($comment) . '",
                       ' . (int)$stars . ',
                       NOW(),
                       0,
                       1
                   )';

           if (!Db::getInstance()->execute($sql)) {
               throw new Exception('Erreur lors de l\'enregistrement de l\'avis');
           }

           $reviewId = Db::getInstance()->Insert_ID();

           die(json_encode([
               'success' => true,
               'message' => 'Avis enregistré avec succès (en attente de modération)',
               'data' => [
                   'id' => $reviewId,
                   'id_product' => $productId,
                   'title' => $title,
                   'comment' => $comment,
                   'stars' => $stars,
                   'date' => date('Y-m-d H:i:s'),
                   'active' => 0
               ]
           ]));
       } catch (Exception $e) {
           die(json_encode([
               'success' => false,
               'message' => 'Erreur lors de l\'ajout de l\'avis: ' . $e->getMessage()
           ]));
       }
    }

    private function getLastOrders($customerId)
    {
        try {
            $customerOrder = Order::getCustomerOrders($customerId, true);
            $recentOrders = array_slice($customerOrder, 0, 5);

            $ordersWithProducts = [];

            foreach ($recentOrders as $orderData) {
                $order = new Order($orderData['id_order']);

                if (!Validate::isLoadedObject($order)) {
                    continue;
                }

                // Récupérer les produits de la commande
                $products = $order->getProducts();

                // Formater les produits
                $formattedProducts = [];
                foreach ($products as $product) {
                    $formattedProducts[] = [
                        'product_id' => $product['product_id'],
                        'product_name' => $product['product_name'],
                        'product_reference' => $product['product_reference'],
                        'product_quantity' => $product['product_quantity'],
                    ];
                }

                $ordersWithProducts[] = [
                    'id_order' => $order->id,
                    'reference' => $order->reference,
                    'date_add' => $order->date_add,
                    'total_paid_tax_incl' => $order->total_paid_tax_incl,
                    'payment' => $order->payment,
                    'current_state' => $order->current_state,
                    'products' => $formattedProducts
                ];
            }

            return $ordersWithProducts;

        } catch (Exception $e) {
            return [];
        }
    }

    private function getCustomerVouchers()
{
    try {
        $customerId = (int)$this->context->customer->id;
        $languageId = (int)$this->context->language->id;

        if (!$customerId) {
            throw new Exception('Client non connecté');
        }
                // avec utilisation des bon génériques TODO -> vérifier avec papa pour ca

                /*$sql = "
                        SELECT 
                            cr.id_cart_rule,
                            cr.description,
                            cr.code,
                            cr.reduction_amount,
                            cr.reduction_percent,
                            cr.active,
                            cr.id_customer,
                            cr.highlight
                        FROM " . _DB_PREFIX_ . "cart_rule cr
                        WHERE cr.active = 1
                            AND cr.date_from <= NOW()
                            AND (cr.date_to >= NOW() OR cr.date_to = '0000-00-00 00:00:00')
                            AND cr.quantity > 0
                            AND (
                                -- Bons personnels (attribués au client)
                                cr.id_customer = " . $customerId . "
                                OR 
                                -- Bons génériques avec code (utilisables par tous)
                                (cr.id_customer = 0 AND cr.code IS NOT NULL AND cr.code != '')
                            )
                        ORDER BY cr.highlight DESC, cr.date_to ASC, cr.priority DESC
                    ";*/

            $sql = "
                    SELECT 
                       cr.id_cart_rule,
                        cr.description,
                        cr.code,
                        cr.reduction_amount,
                        cr.reduction_percent,
                        cr.free_shipping,
                        cr.date_from,
                        cr.date_to,
                        cr.minimum_amount,
                        cr.quantity,
                        cr.quantity_per_user,
                        cr.priority,
                        cr.active,
                        cr.id_customer,
                        cr.gift_product,
                        cr.highlight
                    FROM " . _DB_PREFIX_ . "cart_rule cr
                    WHERE cr.active = 1
                        AND cr.date_from <= NOW()
                        AND (cr.date_to >= NOW() OR cr.date_to = '0000-00-00 00:00:00')
                        AND cr.quantity > 0
                        AND  cr.id_customer = " . $customerId . "
                    ORDER BY cr.highlight DESC, cr.date_to ASC, cr.priority DESC
                ";


        $vouchers = Db::getInstance()->executeS($sql);

        die(json_encode([
            'success' => true,
            'data' => $vouchers ?: [],
            'count' => count($vouchers ?: [])
        ]));

    } catch (Exception $e) {
        die(json_encode([
            'success' => false,
            'message' => 'Erreur: ' . $e->getMessage()
        ]));
    }
}

    private function getCustomerThreads()
    {
        $support = new CustomerSupportManager($this->context);
        $result = $support->getCustomerThreads();
        die(json_encode($result));
    }

    private function getThreadMessages()
    {
        $support = new CustomerSupportManager($this->context);
        $threadId = Tools::getValue('thread_id');
        $result = $support->getThreadMessages($threadId);
        die(json_encode($result));
    }

    private function addMessageToThread()
    {
        $support = new CustomerSupportManager($this->context);
        $threadId = Tools::getValue('thread_id');
        $message = Tools::getValue('message');
        $result = $support->addMessageToThread($threadId, $message);
        die(json_encode($result));
    }

    private function createNewThread()
    {
        $support = new CustomerSupportManager($this->context);
        $result = $support->createNewThread(
            Tools::getValue('subject'),
            Tools::getValue('message'),
            Tools::getValue('order_id', 0),
            Tools::getValue('contact_id', 1)
        );
        die(json_encode($result));
    }

    private function getCustomerOrders()
    {
        $support = new CustomerSupportManager($this->context);
        $result = $support->getCustomerOrders();
        die(json_encode($result));
    }



    /**
     * Override pour éviter l'affichage du template
     */
    public function display()
    {
        // Ne rien faire - on gère tout dans displayAjax
    }
}