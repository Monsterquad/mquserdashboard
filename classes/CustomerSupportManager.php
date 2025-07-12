<?php

/**
 * Classe pour gérer le support client / SAV dans PrestaShop
 * Gestion complète des threads et messages
 */
class CustomerSupportManager
{
    private $context;
    private $customerId;
    private $languageId;

    /**
     * Constructeur
     */
    public function __construct($context = null)
    {
        $this->context = $context ?: Context::getContext();
        $this->customerId = (int)$this->context->customer->id;
        $this->languageId = (int)$this->context->language->id;
    }

    /**
     * Récupère tous les threads d'un customer (version simple)
     */
    public function getCustomerThreads()
    {
        try {
            if (!$this->customerId) {
                throw new Exception('Client non connecté');
            }

            $customerThreads = CustomerThread::getCustomerMessages($this->customerId, false);

            if ($customerThreads && is_array($customerThreads)) {
                usort($customerThreads, function($a, $b) {
                    return  strtotime($b['date_add']) - strtotime($a['date_add']);
                });
            }

            return $this->formatResponse(true, $customerThreads, count($customerThreads ?: []));

        } catch (Exception $e) {
            return $this->formatResponse(false, null, 0, $e->getMessage());
        }
    }

    /**
     * Récupère tous les threads avec informations complètes
     */
    public function getCustomerThreadsComplete()
    {
        try {
            if (!$this->customerId) {
                throw new Exception('Client non connecté');
            }

            $sql = "
                SELECT 
                    ct.id_customer_thread,
                    ct.id_customer,
                    ct.id_order,
                    ct.id_contact,
                    ct.status,
                    ct.email,
                    ct.token,
                    ct.date_add,
                    ct.date_upd,
                    o.reference as order_reference,
                    cl.name as contact_name,
                    -- Premier message (sujet)
                    (SELECT cm1.subject FROM " . _DB_PREFIX_ . "customer_message cm1 
                     WHERE cm1.id_customer_thread = ct.id_customer_thread 
                     ORDER BY cm1.date_add ASC LIMIT 1) as subject,
                    -- Premier message (contenu)
                    (SELECT cm2.message FROM " . _DB_PREFIX_ . "customer_message cm2 
                     WHERE cm2.id_customer_thread = ct.id_customer_thread 
                     ORDER BY cm2.date_add ASC LIMIT 1) as first_message,
                    -- Dernier message
                    (SELECT cm3.message FROM " . _DB_PREFIX_ . "customer_message cm3 
                     WHERE cm3.id_customer_thread = ct.id_customer_thread 
                     ORDER BY cm3.date_add DESC LIMIT 1) as last_message,
                    -- Nombre de messages
                    (SELECT COUNT(*) FROM " . _DB_PREFIX_ . "customer_message cm4 
                     WHERE cm4.id_customer_thread = ct.id_customer_thread) as message_count,
                    -- Dernier message par un employé
                    (SELECT cm5.id_employee FROM " . _DB_PREFIX_ . "customer_message cm5 
                     WHERE cm5.id_customer_thread = ct.id_customer_thread 
                     ORDER BY cm5.date_add DESC LIMIT 1) as last_employee_id
                FROM " . _DB_PREFIX_ . "customer_thread ct
                LEFT JOIN " . _DB_PREFIX_ . "orders o ON ct.id_order = o.id_order
                LEFT JOIN " . _DB_PREFIX_ . "contact_lang cl ON ct.id_contact = cl.id_contact 
                    AND cl.id_lang = " . $this->languageId . "
                WHERE ct.id_customer = " . $this->customerId . "
                ORDER BY ct.date_upd DESC
            ";

            $threads = Db::getInstance()->executeS($sql);

            // Formatage des données
            $formattedThreads = [];
            foreach ($threads as $thread) {
                $formattedThreads[] = [
                    'id' => (int)$thread['id_customer_thread'],
                    'subject' => $thread['subject'],
                    'status' => $thread['status'],
                    'status_label' => $this->getStatusLabel($thread['status']),
                    'order_reference' => $thread['order_reference'],
                    'contact_name' => $thread['contact_name'],
                    'first_message' => $thread['first_message'],
                    'last_message' => $thread['last_message'],
                    'message_count' => (int)$thread['message_count'],
                    'has_employee_response' => !empty($thread['last_employee_id']),
                    'date_add' => $thread['date_add'],
                    'date_upd' => $thread['date_upd'],
                    'formatted_date_add' => $this->formatDate($thread['date_add']),
                    'formatted_date_upd' => $this->formatDate($thread['date_upd']),
                    'preview' => $this->truncateText($thread['first_message'], 150)
                ];
            }

            return $this->formatResponse(true, $formattedThreads, count($formattedThreads));

        } catch (Exception $e) {
            return $this->formatResponse(false, null, 0, $e->getMessage());
        }
    }

    /**
     * Récupère tous les messages d'un thread spécifique
     */
    public function getThreadMessages($threadId)
    {
        try {
            $threadId = (int)$threadId;

            if (!$this->customerId || !$threadId) {
                throw new Exception('Paramètres manquants');
            }

            // Vérifier que le thread appartient au customer
            if (!$this->verifyThreadOwnership($threadId)) {
                throw new Exception('Thread non trouvé ou non autorisé');
            }

            // Récupérer les infos du thread
            $threadInfo = $this->getThreadInfo($threadId);

            // Récupérer tous les messages
            $sql = "
                SELECT 
                    cm.id_customer_message,
                    cm.id_customer_thread,
                    cm.id_employee,
                    cm.subject,
                    cm.message,
                    cm.file_name,
                    cm.ip_address,
                    cm.user_agent,
                    cm.date_add,
                    e.firstname as employee_firstname,
                    e.lastname as employee_lastname
                FROM " . _DB_PREFIX_ . "customer_message cm
                LEFT JOIN " . _DB_PREFIX_ . "employee e ON cm.id_employee = e.id_employee
                WHERE cm.id_customer_thread = " . $threadId . "
                ORDER BY cm.date_add ASC
            ";

            $messages = Db::getInstance()->executeS($sql);

            // Formatage des messages
            $formattedMessages = [];
            foreach ($messages as $message) {
                $formattedMessages[] = [
                    'id' => (int)$message['id_customer_message'],
                    'thread_id' => (int)$message['id_customer_thread'],
                    'subject' => $message['subject'],
                    'message' => $message['message'],
                    'file_name' => $message['file_name'],
                    'date_add' => $message['date_add'],
                    'formatted_date' => $this->formatDate($message['date_add']),
                    'is_employee_response' => !empty($message['id_employee']),
                    'employee_name' => !empty($message['employee_firstname'])
                        ? trim($message['employee_firstname'] . ' ' . $message['employee_lastname'])
                        : null,
                    'author' => !empty($message['id_employee'])
                        ? (trim($message['employee_firstname'] . ' ' . $message['employee_lastname']) ?: 'Support')
                        : 'Vous'
                ];
            }

            return $this->formatResponse(true, [
                'thread' => $threadInfo,
                'messages' => $formattedMessages
            ], count($formattedMessages));

        } catch (Exception $e) {
            return $this->formatResponse(false, null, 0, $e->getMessage());
        }
    }

    /**
     * Ajoute un message à un thread existant
     */
    public function addMessageToThread($threadId, $message)
    {
        try {
            $threadId = (int)$threadId;
            $message = trim($message);

            if (!$this->customerId || !$threadId || empty($message)) {
                throw new Exception('Paramètres manquants');
            }

            // Vérifier la propriété du thread
            if (!$this->verifyThreadOwnership($threadId)) {
                throw new Exception('Thread non trouvé ou non autorisé');
            }

            // Créer le message
            $customerMessage = new CustomerMessage();
            $customerMessage->id_customer_thread = $threadId;
            $customerMessage->message = pSQL($message);
            $customerMessage->file_name = '';
            $customerMessage->ip_address = Tools::getRemoteAddr();
            $customerMessage->user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
            $customerMessage->date_add = date('Y-m-d H:i:s');

            if (!$customerMessage->save()) {
                throw new Exception('Erreur lors de l\'enregistrement du message');
            }

            // Mettre à jour le thread
            $this->updateThreadStatus($threadId, 'open');

            return $this->formatResponse(true, [
                'message_id' => $customerMessage->id,
                'thread_id' => $threadId
            ], 1, 'Message ajouté avec succès');

        } catch (Exception $e) {
            return $this->formatResponse(false, null, 0, $e->getMessage());
        }
    }

    /**
     * Crée un nouveau thread avec le premier message
     */
    public function createNewThread($subject, $message, $orderId = 0, $contactId = 1)
    {
        try {
            $subject = trim($subject);
            $message = trim($message);
            $orderId = (int)$orderId;
            $contactId = (int)$contactId;

            if (!$this->customerId || empty($subject) || empty($message)) {
                throw new Exception('Paramètres manquants');
            }

            // Créer le thread
            $customerThread = new CustomerThread();
            $customerThread->id_customer = $this->customerId;
            $customerThread->id_order = $orderId > 0 ? $orderId : null;
            $customerThread->id_contact = $contactId;
            $customerThread->id_lang = $this->languageId;
            $customerThread->email = $this->context->customer->email;
            $customerThread->status = 'open';
            $customerThread->token = Tools::passwdGen(12);
            $customerThread->date_add = date('Y-m-d H:i:s');
            $customerThread->date_upd = date('Y-m-d H:i:s');

            if (!$customerThread->save()) {
                throw new Exception('Erreur lors de la création du thread');
            }

            // Ajouter le premier message
            $customerMessage = new CustomerMessage();
            $customerMessage->id_customer_thread = $customerThread->id;
            $customerMessage->subject = pSQL($subject);
            $customerMessage->message = pSQL($message);
            $customerMessage->file_name = '';
            $customerMessage->ip_address = Tools::getRemoteAddr();
            $customerMessage->user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
            $customerMessage->date_add = date('Y-m-d H:i:s');

            if (!$customerMessage->save()) {
                throw new Exception('Erreur lors de l\'enregistrement du message');
            }

            return $this->formatResponse(true, [
                'thread_id' => $customerThread->id,
                'message_id' => $customerMessage->id
            ], 1, 'Thread créé avec succès');

        } catch (Exception $e) {
            return $this->formatResponse(false, null, 0, $e->getMessage());
        }
    }

    /**
     * Récupère les commandes du client pour créer un thread
     */
    public function getCustomerOrders($limit = 20)
    {
        try {
            if (!$this->customerId) {
                throw new Exception('Client non connecté');
            }

            $sql = "
                SELECT 
                    o.id_order,
                    o.reference,
                    o.date_add,
                    os.name as status_name,
                    o.total_paid_tax_incl
                FROM " . _DB_PREFIX_ . "orders o
                LEFT JOIN " . _DB_PREFIX_ . "order_state_lang os ON o.current_state = os.id_order_state 
                    AND os.id_lang = " . $this->languageId . "
                WHERE o.id_customer = " . $this->customerId . "
                ORDER BY o.date_add DESC
                LIMIT " . (int)$limit . "
            ";

            $orders = Db::getInstance()->executeS($sql);

            $formattedOrders = [];
            foreach ($orders as $order) {
                $formattedOrders[] = [
                    'id' => (int)$order['id_order'],
                    'reference' => $order['reference'],
                    'date' => $order['date_add'],
                    'formatted_date' => $this->formatDate($order['date_add']),
                    'status' => $order['status_name'],
                    'total' => $this->formatPrice($order['total_paid_tax_incl'])
                ];
            }

            return $this->formatResponse(true, $formattedOrders, count($formattedOrders));

        } catch (Exception $e) {
            return $this->formatResponse(false, null, 0, $e->getMessage());
        }
    }

    /**
     * Méthodes utilitaires privées
     */

    /**
     * Vérifie que le thread appartient au customer
     */
    private function verifyThreadOwnership($threadId)
    {
        $sql = "
            SELECT id_customer_thread 
            FROM " . _DB_PREFIX_ . "customer_thread 
            WHERE id_customer_thread = " . (int)$threadId . " 
            AND id_customer = " . $this->customerId . "
        ";

        return (bool)Db::getInstance()->getValue($sql);
    }

    /**
     * Récupère les infos d'un thread
     */
    private function getThreadInfo($threadId)
    {
        $sql = "
            SELECT 
                ct.*,
                o.reference as order_reference,
                cl.name as contact_name
            FROM " . _DB_PREFIX_ . "customer_thread ct
            LEFT JOIN " . _DB_PREFIX_ . "orders o ON ct.id_order = o.id_order
            LEFT JOIN " . _DB_PREFIX_ . "contact_lang cl ON ct.id_contact = cl.id_contact 
                AND cl.id_lang = " . $this->languageId . "
            WHERE ct.id_customer_thread = " . (int)$threadId . "
        ";

        $thread = Db::getInstance()->getRow($sql);

        if ($thread) {
            return [
                'id' => (int)$thread['id_customer_thread'],
                'status' => $thread['status'],
                'status_label' => $this->getStatusLabel($thread['status']),
                'order_reference' => $thread['order_reference'],
                'contact_name' => $thread['contact_name'],
                'date_add' => $thread['date_add'],
                'date_upd' => $thread['date_upd'],
                'formatted_date_add' => $this->formatDate($thread['date_add']),
                'formatted_date_upd' => $this->formatDate($thread['date_upd'])
            ];
        }

        return null;
    }

    /**
     * Met à jour le statut d'un thread
     */
    private function updateThreadStatus($threadId, $status = 'open')
    {
        $sql = "
            UPDATE " . _DB_PREFIX_ . "customer_thread 
            SET date_upd = NOW(), status = '" . pSQL($status) . "'
            WHERE id_customer_thread = " . (int)$threadId . "
        ";

        return Db::getInstance()->execute($sql);
    }

    /**
     * Formate les labels de statut
     */
    private function getStatusLabel($status)
    {
        $statuses = [
            'open' => 'Ouvert',
            'closed' => 'Fermé',
            'pending1' => 'En attente de réponse',
            'pending2' => 'En cours de traitement'
        ];

        return isset($statuses[$status]) ? $statuses[$status] : ucfirst($status);
    }

    /**
     * Formate une date
     */
    private function formatDate($dateString)
    {
        if (!$dateString) return '-';

        $date = new DateTime($dateString);
        return $date->format('d/m/Y à H:i');
    }

    /**
     * Formate un prix
     */
    private function formatPrice($price)
    {
        return number_format((float)$price, 2, ',', ' ') . ' €';
    }

    /**
     * Tronque un texte
     */
    private function truncateText($text, $length = 100)
    {
        if (!$text || strlen($text) <= $length) {
            return $text;
        }

        return substr($text, 0, $length) . '...';
    }

    /**
     * Formate la réponse JSON
     */
    private function formatResponse($success, $data = null, $count = 0, $message = null)
    {
        $response = [
            'success' => $success,
            'data' => $data,
            'count' => $count
        ];

        if ($message) {
            $response['message'] = $message;
        }

        return $response;
    }

    /**
     * Méthode pour traiter les appels AJAX
     */
    /*public function processAction($action, $params = [])
    {
        switch ($action) {
            case 'getCustomerThreads':
                return $this->getCustomerThreads();

            case 'getCustomerThreadsComplete':
                return $this->getCustomerThreadsComplete();

            case 'getThreadMessages':
                return $this->getThreadMessages($params['thread_id'] ?? 0);

            case 'addMessageToThread':
                return $this->addMessageToThread(
                    $params['thread_id'] ?? 0,
                    $params['message'] ?? ''
                );

            case 'createNewThread':
                return $this->createNewThread(
                    $params['subject'] ?? '',
                    $params['message'] ?? '',
                    $params['order_id'] ?? 0,
                    $params['contact_id'] ?? 1
                );

            case 'getCustomerOrders':
                return $this->getCustomerOrders($params['limit'] ?? 20);

            default:
                return $this->formatResponse(false, null, 0, 'Action non reconnue');
        }
    }*/
}

/*
// Exemple d'utilisation dans votre contrôleur :

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
*/