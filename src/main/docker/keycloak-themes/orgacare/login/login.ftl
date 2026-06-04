<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "header">
        ${msg("loginAccountTitle")}
    <#elseif section = "form">

    <div class="oc-login-wrapper">
        <div class="oc-brand">
            <img src="${url.resourcesPath}/img/logo.png" alt="OrgaCare" class="oc-logo"/>
            <span class="oc-brand-name">OrgaCare</span>
        </div>
        <h2 class="oc-title">Bon retour 👋</h2>
        <p class="oc-subtitle">Connectez-vous avec votre compte d entreprise</p>

        <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
            <div class="oc-field">
                <label for="username">Nom d utilisateur</label>
                <input tabindex="1" id="username" name="username" type="text"
                       autofocus autocomplete="off"
                       value="${(login.username!'')}"
                       placeholder="votre.nom@entreprise.com"/>
            </div>

            <div class="oc-field">
                <label for="password">Mot de passe</label>
                <input tabindex="2" id="password" name="password" type="password"
                       autocomplete="off" placeholder="••••••••"/>
            </div>

            <#if messagesPerField.existsError('username','password')>
                <div class="oc-error">
                    ${esc.html(messagesPerField.getFirstError('username','password'))}
                </div>
            </#if>

            <input type="hidden" id="id-hidden-input" name="credentialId"
                   <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>

            <button tabindex="4" type="submit" id="kc-login" class="oc-btn">
                Se connecter
            </button>
        </form>
    </div>

    </#if>
</@layout.registrationLayout>
