<?php
/**
 * Classe pour gérer les données client du dashboard
 * Path: modules/mquserdashboard/classes/CustomerDashboard.php
 */

class CustomerDashboard
{
    private $customerId;
    private $customer;
    private $context;

    public function __construct($customerId)
    {
        $this->customerId = (int)$customerId;
        $this->customer = new Customer($this->customerId);
        $this->context = Context::getContext();
    }

    /**
     * Récupère toutes les données du client
     */
    public function getCustomerData()
    {
        if (!Validate::isLoadedObject($this->customer)) {
            return null;
        }

        return [
            'id' => $this->customer->id,
            'gender' => $this->getGenderName($this->customer->id_gender),
            'firstname' => $this->customer->firstname,
            'lastname' => $this->customer->lastname,
            'email' => $this->customer->email,
            'birthday' => $this->customer->birthday,
            'newsletter' => (bool)$this->customer->newsletter,
            'optin' => (bool)$this->customer->optin,
            'date_add' => $this->customer->date_add,
            'addresses' => $this->getCustomerAddresses(),
            'groups' => $this->getCustomerGroups(),
            'last_connection' => $this->getLastConnection(),
            'loyalty_points' => $this->getLoyaltyPoints(),
            'wishlist_count' => $this->getWishlistCount()
        ];
    }

    /**
     * Récupère les adresses du client
     */
    public function getCustomerAddresses()
    {
        $addresses = $this->customer->getAddresses($this->context->language->id);
        $formattedAddresses = [];

        foreach ($addresses as $address) {
            $formattedAddresses[] = [
                'id' => $address['id_address'],
                'alias' => $address['alias'],
                'company' => $address['company'],
                'lastname' => $address['lastname'],
                'firstname' => $address['firstname'],
                'address1' => $address['address1'],
                'address2' => $address['address2'],
                'postcode' => $address['postcode'],
                'city' => $address['city'],
                'country' => $address['country'],
                'phone' => $address['phone'],
                'phone_mobile' => $address['phone_mobile'],
                'is_default' => $this->isDefaultAddress($address['id_address'])
            ];
        }

        return $formattedAddresses;
    }

    /**
     * Vérifie si une adresse est l'adresse par défaut
     */
    private function isDefaultAddress($addressId)
    {
        $sql = 'SELECT id_address FROM ' . _DB_PREFIX_ . 'address 
                WHERE id_customer = ' . (int)$this->customerId . ' 
                AND deleted = 0 
                ORDER BY id_address ASC 
                LIMIT 1';

        $defaultId = Db::getInstance()->getValue($sql);
        return (int)$addressId === (int)$defaultId;
    }

    /**
     * Récupère les groupes du client
     */
    public function getCustomerGroups()
    {
        $groups = $this->customer->getGroups();
        $groupData = [];

        foreach ($groups as $groupId) {
            $group = new Group($groupId, $this->context->language->id);
            $groupData[] = [
                'id' => $group->id,
                'name' => $group->name
            ];
        }

        return $groupData;
    }

    /**
     * Récupère la dernière connexion
     */
    private function getLastConnection()
    {
        $sql = 'SELECT date_add FROM ' . _DB_PREFIX_ . 'connections 
                WHERE id_guest IN (
                    SELECT id_guest FROM ' . _DB_PREFIX_ . 'guest 
                    WHERE id_customer = ' . (int)$this->customerId . '
                ) 
                ORDER BY date_add DESC 
                LIMIT 1';

        return Db::getInstance()->getValue($sql);
    }

    /**
     * Récupère les points de fidélité (si module installé)
     */
    private function getLoyaltyPoints()
    {
        if (Module::isInstalled('loyalty') && Module::isEnabled('loyalty')) {
            $sql = 'SELECT SUM(points) FROM ' . _DB_PREFIX_ . 'loyalty 
                    WHERE id_customer = ' . (int)$this->customerId . ' 
                    AND id_loyalty_state = 2';

            return (int)Db::getInstance()->getValue($sql);
        }

        return 0;
    }

    /**
     * Récupère le nombre d'articles en liste de souhaits
     */
    private function getWishlistCount()
    {
        if (Module::isInstalled('blockwishlist') && Module::isEnabled('blockwishlist')) {
            $sql = 'SELECT COUNT(DISTINCT wp.id_product) 
                    FROM ' . _DB_PREFIX_ . 'wishlist w
                    LEFT JOIN ' . _DB_PREFIX_ . 'wishlist_product wp ON w.id_wishlist = wp.id_wishlist
                    WHERE w.id_customer = ' . (int)$this->customerId;

            return (int)Db::getInstance()->getValue($sql);
        }

        return 0;
    }

    /**
     * Récupère le nom du genre
     */
    private function getGenderName($genderId)
    {
        $gender = new Gender($genderId, $this->context->language->id);
        return Validate::isLoadedObject($gender) ? $gender->name : '';
    }
}