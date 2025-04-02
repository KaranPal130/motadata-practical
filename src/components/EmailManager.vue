<template>
    <div class="email-manager">
      <a-row :gutter="24">
        <!-- Available Recipients Column -->
        <a-col :span="12">
          <a-card title="Available recipients" :bordered="true">
            <a-input-search
              v-model:value="searchText"
              placeholder="search"
              style="margin-bottom: 16px"
              @search="onSearch"
              @change="onSearch"
            />
            
            <!-- Company Domain Groups -->
            <a-collapse v-model:activeKey="activeKeys" style="margin-bottom: 16px">
              <a-collapse-panel 
                v-for="(domainGroup, domain) in availableDomainGroups" 
                :key="domain" 
                :header="domain"
              >
                <div 
                  v-for="email in domainGroup" 
                  :key="email" 
                  class="email-item"
                  @click="selectRecipient(email)"
                >
                  {{ email }}
                </div>
              </a-collapse-panel>
            </a-collapse>
            
            <!-- Ungrouped Emails -->
            <div 
              v-for="email in filteredUngroupedEmails" 
              :key="email" 
              class="email-item"
              @click="selectRecipient(email)"
            >
              {{ email }}
            </div>
            
            <!-- Add New Email Form -->
            <a-form layout="inline" style="margin-top: 16px">
              <a-form-item>
                <a-auto-complete
                  v-model:value="newEmail"
                  :options="autoCompleteOptions"
                  style="width: 200px"
                  placeholder="Add new email"
                  @search="onAutoCompleteSearch"
                />
              </a-form-item>
              <a-form-item>
                <a-button type="primary" @click="addNewEmail" :disabled="!isValidEmail(newEmail)">Add</a-button>
              </a-form-item>
            </a-form>
          </a-card>
        </a-col>
  
        <!-- Selected Recipients Column -->
        <a-col :span="12">
          <a-card title="Selected recipients" :bordered="true">
            <!-- Company Recipients Group -->
            <a-collapse v-model:activeKey="selectedActiveKeys">
              <a-collapse-panel key="company" header="company recipients">
                <div v-for="(emails, domain) in selectedCompanyGroups" :key="domain" class="domain-group">
                  <div class="domain-header">
                    <span>{{ domain }}</span>
                    <a-button type="text" danger @click="removeCompanyDomain(String(domain))">
                      <delete-outlined />
                    </a-button>
                  </div>
                  <div 
                    v-for="email in emails" 
                    :key="email" 
                    class="email-item selected-email"
                  >
                    {{ email }}
                    <a-button type="text" danger @click.stop="unselectRecipient(email)">
                      <delete-outlined />
                    </a-button>
                  </div>
                </div>
              </a-collapse-panel>
              
              <!-- Individual Email Recipients -->
              <a-collapse-panel key="email" header="email recipients">
                <div 
                  v-for="email in selectedIndividualEmails" 
                  :key="email" 
                  class="email-item selected-email"
                >
                  {{ email }}
                  <a-button type="text" danger @click.stop="unselectRecipient(email)">
                    <delete-outlined />
                  </a-button>
                </div>
              </a-collapse-panel>
            </a-collapse>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, computed, ComputedRef } from 'vue';
  import { DeleteOutlined } from '@ant-design/icons-vue';
  
  // Define interfaces
  interface Recipient {
    email: string;
    isSelected: boolean;
  }
  
  interface DomainGroups {
    [key: string]: string[];
  }
  
  interface AutoCompleteOption {
    value: string;
  }
  
  export default defineComponent({
    name: 'EmailManager',
    components: {
      DeleteOutlined
    },
    setup() {
      // Sample data with type annotation
      const recipients = ref<Recipient[]>([
        { email: "ann@timescale.com", isSelected: false },
        { email: "bob@timescale.com", isSelected: false },
        { email: "brian@qwerty.com", isSelected: true },
        { email: "james@qwerty.com", isSelected: false },
        { email: "jane@awesome.com", isSelected: false },
        { email: "kate@qwerty.com", isSelected: true },
        { email: "mike@hello.com", isSelected: true }
      ]);
  
      const searchText = ref<string>('');
      const newEmail = ref<string>('');
      const activeKeys = ref<string[]>(['timescale.com', 'qwerty.com', 'awesome.com', 'hello.com']);
      const selectedActiveKeys = ref<string[]>(['company', 'email']);
      const autoCompleteOptions = ref<AutoCompleteOption[]>([]);
  
      // Group recipients by domain with type annotations
      const groupByDomain = (items: Recipient[]): DomainGroups => {
        const groups: DomainGroups = {};
        
        items.forEach(item => {
          const email = item.email;
          const domain = email.split('@')[1];
          
          if (!groups[domain]) {
            groups[domain] = [];
          }
          
          groups[domain].push(email);
        });
        
        return groups;
      };
  
      // Computed properties with return type annotations
      const availableDomainGroups: ComputedRef<DomainGroups> = computed(() => {
        const availableRecipients = recipients.value.filter(r => !r.isSelected);
        return groupByDomain(availableRecipients);
      });
  
      const filteredUngroupedEmails: ComputedRef<string[]> = computed(() => {
        const availableEmails = recipients.value
          .filter(r => !r.isSelected)
          .map(r => r.email);
        
        if (!searchText.value) {
          return [];
        }
        
        return availableEmails.filter(email => 
          email.toLowerCase().includes(searchText.value.toLowerCase()));
      });
  
      const selectedCompanyGroups: ComputedRef<DomainGroups> = computed(() => {
        const selectedRecipients = recipients.value.filter(r => r.isSelected);
        const groups = groupByDomain(selectedRecipients);
        
        const companyGroups: DomainGroups = {};
        
        Object.entries(groups).forEach(([domain, emails]) => {
          if (emails.length > 1) {
            companyGroups[domain] = emails;
          }
        });
        
        return companyGroups;
      });
  
      const selectedIndividualEmails: ComputedRef<string[]> = computed(() => {
        const selectedRecipients = recipients.value.filter(r => r.isSelected);
        const groups = groupByDomain(selectedRecipients);
        
        let individualEmails: string[] = [];
        
        Object.entries(groups).forEach(([domain, emails]) => {
          if (emails.length === 1) {
            individualEmails = [...individualEmails, ...emails];
          }
        });
        
        return individualEmails;
      });
  
      // Methods with type annotations
      const selectRecipient = (email: string): void => {
        const recipient = recipients.value.find(r => r.email === email);
        if (recipient) {
          recipient.isSelected = true;
        }
      };
  
      const selectDomain = (domain: string): void => {
        recipients.value.forEach(recipient => {
          if (recipient.email.endsWith(`@${domain}`)) {
            recipient.isSelected = true;
          }
        });
      };
  
      const unselectRecipient = (email: string): void => {
        const recipient = recipients.value.find(r => r.email === email);
        if (recipient) {
          recipient.isSelected = false;
        }
      };
  
      const removeCompanyDomain = (domain: string): void => {
        recipients.value.forEach(recipient => {
          if (recipient.email.endsWith(`@${domain}`)) {
            recipient.isSelected = false;
          }
        });
      };
  
      const onSearch = (): void => {
        // This function updates the filteredUngroupedEmails computed property automatically
        if (!searchText.value) {
          return;
        }
        
        // Also update autocomplete options based on search text
        const availableDomains = Object.keys(availableDomainGroups.value);
        const suggestions: AutoCompleteOption[] = [];
        
        // Add domain suggestions
        availableDomains.forEach(domain => {
          if (domain.toLowerCase().includes(searchText.value.toLowerCase())) {
            suggestions.push({ value: domain });
          }
        });
        
        // Add email suggestions from available recipients
        recipients.value
          .filter(recipient => !recipient.isSelected)
          .forEach(recipient => {
            if (recipient.email.toLowerCase().includes(searchText.value.toLowerCase())) {
              suggestions.push({ value: recipient.email });
            }
          });
        
        autoCompleteOptions.value = suggestions;
      };

      const onAutoCompleteSearch = (text: string): void => {
        if (!text) {
          autoCompleteOptions.value = [];
          return;
        }
  
        const availableDomains = Object.keys(availableDomainGroups.value);
        const suggestions: AutoCompleteOption[] = [];
  
        availableDomains.forEach(domain => {
          if (domain.toLowerCase().includes(text.toLowerCase())) {
            suggestions.push({ value: domain });
          }
        });
  
        recipients.value.forEach(recipient => {
          if (recipient.email.toLowerCase().includes(text.toLowerCase())) {
            suggestions.push({ value: recipient.email });
          }
        });
  
        autoCompleteOptions.value = suggestions;
      };
  
      const isValidEmail = (email: string): boolean => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      };
  
      const addNewEmail = (): void => {
        if (isValidEmail(newEmail.value)) {
          const exists = recipients.value.some(r => r.email === newEmail.value);
          
          if (!exists) {
            recipients.value.push({
              email: newEmail.value,
              isSelected: false
            });
            
            const domain = newEmail.value.split('@')[1];
            
            if (!activeKeys.value.includes(domain)) {
              activeKeys.value.push(domain);
            }
          }
          
          newEmail.value = '';
        }
      };
  
      return {
        recipients,
        searchText,
        newEmail,
        activeKeys,
        selectedActiveKeys,
        autoCompleteOptions,
        availableDomainGroups,
        filteredUngroupedEmails,
        selectedCompanyGroups,
        selectedIndividualEmails,
        selectRecipient,
        selectDomain,
        unselectRecipient,
        removeCompanyDomain,
        onSearch,
        onAutoCompleteSearch,
        isValidEmail,
        addNewEmail
      };
    }
  });
  </script>
  
  <style scoped>
  .email-manager {
    font-family: Arial, sans-serif;
  }
  
  .email-item {
    padding: 8px;
    cursor: pointer;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .email-item:hover {
    background-color: #f5f5f5;
  }
  
  .selected-email {
    cursor: default;
  }
  
  .domain-group {
    margin-bottom: 12px;
  }
  
  .domain-header {
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  </style>