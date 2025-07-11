<?php


class MyAccountController extends MyAccountControllerCore
{

    public function initContent()
    {
       $this->context->smarty->assign([
            'logout_url' => $this->context->link->getPageLink('index', null, null, 'mylogout'),
            'customer_id' => $this->context->customer->id,
        ]);

        parent::initContent();
        $this->setTemplate('customer/dashboard.tpl');
    }
}