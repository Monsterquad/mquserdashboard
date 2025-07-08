{*
* Template: Mon Compte Dashboard Complet
* Path: modules/mquserdashboard/views/templates/my-account-dashboard.tpl
*}

{extends file='page.tpl'}

{block name='page_title'}
  <h1 class="h1">{l s='Your account' d='Shop.Theme.CustomerAccount'}</h1>
{/block}

{block name='page_content'}

<div class="mq-dashboard-fullpage">
    <!-- En-tête Dashboard -->
    <div class="dashboard-header">
        <div class="welcome-section">
            <h1 class="dashboard-title">
                👋 Bonjour {$customer_info.firstname} !
            </h1>
            <p class="dashboard-subtitle">Voici un aperçu de votre compte</p>
        </div>

        <div class="quick-stats">
            <div class="stat-card">
                <div class="stat-icon">📦</div>
                <div class="stat-content">
                    <span class="stat-number">{$stats.total_orders}</span>
                    <span class="stat-label">Commandes</span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-content">
                    <span class="stat-number">{$stats.total_spent}</span>
                    <span class="stat-label">Total dépensé</span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">🏠</div>
                <div class="stat-content">
                    <span class="stat-number">{$stats.total_addresses}</span>
                    <span class="stat-label">Adresses</span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">🎟️</div>
                <div class="stat-content">
                    <span class="stat-number">{$stats.active_vouchers}</span>
                    <span class="stat-label">Bons actifs</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Contenu principal du dashboard -->
    <div class="dashboard-content">

        <!-- Section Profil -->
        <div class="dashboard-section profile-section">
            <div class="section-header">
                <h2 class="section-title">
                    <i class="material-icons">person</i>
                    Mon Profil
                </h2>
                <a href="{$urls.pages.identity}" class="section-action">
                    <i class="material-icons">edit</i>
                    Modifier
                </a>
            </div>

            <div class="profile-card">
                <div class="profile-avatar">
                    <div class="avatar-placeholder">
                        {$customer_info.firstname|substr:0:1|upper}{$customer_info.lastname|substr:0:1|upper}
                    </div>
                </div>

                <div class="profile-info">
                    <h3 class="profile-name">{$customer_info.firstname} {$customer_info.lastname}</h3>
                    <p class="profile-email">{$customer_info.email}</p>

                    <div class="profile-details">
                        <div class="detail-item">
                            <span class="detail-label">Membre depuis:</span>
                            <span class="detail-value">{$customer_info.registration_date|date_format:'%d/%m/%Y'}</span>
                        </div>

                        {if $customer_info.birthday && $customer_info.birthday != '0000-00-00'}
                        <div class="detail-item">
                            <span class="detail-label">Anniversaire:</span>
                            <span class="detail-value">{$customer_info.birthday|date_format:'%d/%m/%Y'}</span>
                        </div>
                        {/if}

                        <div class="detail-item">
                            <span class="detail-label">Newsletter:</span>
                            <span class="detail-value">
                                {if $customer_info.newsletter}
                                    <span class="status-badge active">✓ Activée</span>
                                {else}
                                    <span class="status-badge inactive">✗ Désactivée</span>
                                {/if}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section Commandes Récentes -->
        <div class="dashboard-section orders-section">
            <div class="section-header">
                <h2 class="section-title">
                    <i class="material-icons">shopping_bag</i>
                    Commandes Récentes
                </h2>
                <a href="{$urls.pages.history}" class="section-action">
                    <i class="material-icons">arrow_forward</i>
                    Voir tout
                </a>
            </div>

            <div class="orders-list">
                {if $recent_orders && count($recent_orders) > 0}
                    {foreach from=$recent_orders item=order}
                    <div class="order-card">
                        <div class="order-header">
                            <div class="order-ref">
                                <strong>#{$order.reference}</strong>
                                <span class="order-date">{$order.date_add|date_format:'%d/%m/%Y'}</span>
                            </div>
                            <div class="order-status">
                                <span class="status-badge">
                                    {$order.order_state.name}
                                </span>
                            </div>
                        </div>

                        <div class="order-details">
                            <div class="order-info">
                                <span class="order-total">{$order.total_paid} €</span>
                                <span class="order-items">{$order.products_count} article(s)</span>
                            </div>
                            <div class="order-payment">
                                <small>Paiement: {$order.payment}</small>
                            </div>
                        </div>

                        <div class="order-actions">
                            <a href="{$urls.pages.order_detail}?id_order={$order.id_order}"
                               class="btn-action">Détails</a>
                        </div>
                    </div>
                    {/foreach}
                {else}
                    <div class="empty-state">
                        <i class="material-icons">shopping_cart</i>
                        <p>Aucune commande récente</p>
                        <a href="{$urls.base_url}" class="btn-primary">Commencer à acheter</a>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Section Adresses -->
        <div class="dashboard-section addresses-section">
            <div class="section-header">
                <h2 class="section-title">
                    <i class="material-icons">location_on</i>
                    Mes Adresses
                </h2>
                <a href="{$urls.pages.addresses}" class="section-action">
                    <i class="material-icons">add</i>
                    Ajouter
                </a>
            </div>

            <div class="addresses-grid">
                {if $addresses && count($addresses) > 0}
                    {foreach from=$addresses item=address}
                    <div class="address-card">
                        <div class="address-header">
                            <h4 class="address-alias">{$address.alias}</h4>
                        </div>

                        <div class="address-content">
                            <p class="address-name">{$address.firstname} {$address.lastname}</p>
                            <p class="address-line">{$address.address1}</p>
                            {if $address.address2}
                                <p class="address-line">{$address.address2}</p>
                            {/if}
                            <p class="address-line">{$address.postcode} {$address.city}</p>
                            <p class="address-country">{$address.country}</p>

                            {if $address.phone}
                                <p class="address-phone">
                                    <i class="material-icons">phone</i>
                                    {$address.phone}
                                </p>
                            {/if}
                        </div>

                        <div class="address-actions">
                            <a href="{$urls.pages.address}?id_address={$address.id_address}"
                               class="btn-action">Modifier</a>
                        </div>
                    </div>
                    {/foreach}
                {else}
                    <div class="empty-state">
                        <i class="material-icons">add_location</i>
                        <p>Aucune adresse enregistrée</p>
                        <a href="{$urls.pages.address}" class="btn-primary">Ajouter une adresse</a>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Actions Rapides -->
        <div class="dashboard-section quick-actions-section">
            <div class="section-header">
                <h2 class="section-title">
                    <i class="material-icons">flash_on</i>
                    Actions Rapides
                </h2>
            </div>

            <div class="quick-actions-grid">
                <a href="{$urls.pages.history}" class="quick-action-card">
                    <i class="material-icons">history</i>
                    <span>Historique</span>
                </a>

                <a href="{$urls.pages.order_follow}" class="quick-action-card">
                    <i class="material-icons">track_changes</i>
                    <span>Suivi</span>
                </a>

                <a href="{$urls.pages.order_slip}" class="quick-action-card">
                    <i class="material-icons">receipt</i>
                    <span>Avoirs</span>
                </a>

                <a href="{$urls.pages.addresses}" class="quick-action-card">
                    <i class="material-icons">location_on</i>
                    <span>Adresses</span>
                </a>

                <a href="{$urls.pages.identity}" class="quick-action-card">
                    <i class="material-icons">edit</i>
                    <span>Profil</span>
                </a>

                <a href="{$urls.actions.logout}" class="quick-action-card logout">
                    <i class="material-icons">logout</i>
                    <span>Déconnexion</span>
                </a>
            </div>
        </div>

    </div>
</div>

{/block}