<?php


class MyAccountController extends MyAccountControllerCore
{

    /**
     * Override simple pour retourner notre template
     */
    public function initContent()
    {
        $this->context->smarty->assign([
            'logout_url' => $this->context->link->getPageLink('index', null, null, 'mylogout'),
            'customer_id' => $this->context->customer->id,
        ]);

        parent::initContent();
        $this->setTemplate('customer/dashboard');
    }
}