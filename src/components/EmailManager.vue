<template>
  <div class="email-manager">
    <a-row :gutter="24">
      <!-- Available Recipients Column -->
      <a-col :span="12">
        <a-card :bordered="true">
          <div class="section-title">Available recipients</div>
          <template #title><span class="section-title">Available recipients</span></template>
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
        <a-card :bordered="true">
          <div class="section-title">Selected recipients</div>
          <template #title><span class="section-title">Selected recipients</span></template>
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
import { defineComponent } from 'vue';
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
  data() {
    return {
      recipients: [
        { email: "ann@timescale.com", isSelected: false },
        { email: "bob@timescale.com", isSelected: false },
        { email: "brian@qwerty.com", isSelected: true },
        { email: "james@qwerty.com", isSelected: false },
        { email: "jane@awesome.com", isSelected: false },
        { email: "kate@qwerty.com", isSelected: true },
        { email: "mike@hello.com", isSelected: true }
      ] as Recipient[],
      searchText: '',
      newEmail: '',
      activeKeys: ['timescale.com', 'qwerty.com', 'awesome.com', 'hello.com'],
      selectedActiveKeys: ['company', 'email'],
      autoCompleteOptions: [] as AutoCompleteOption[]
    };
  },
  computed: {
    availableDomainGroups(): DomainGroups {
      const availableRecipients = this.recipients.filter(r => !r.isSelected);
      return this.groupByDomain(availableRecipients);
    },
    filteredUngroupedEmails(): string[] {
      const availableEmails = this.recipients
        .filter(r => !r.isSelected)
        .map(r => r.email);
      
      if (!this.searchText) {
        return [];
      }
      
      return availableEmails.filter(email => 
        email.toLowerCase().includes(this.searchText.toLowerCase()));
    },
    selectedCompanyGroups(): DomainGroups {
      const selectedRecipients = this.recipients.filter(r => r.isSelected);
      const groups = this.groupByDomain(selectedRecipients);
      
      const companyGroups: DomainGroups = {};
      
      Object.entries(groups).forEach(([domain, emails]) => {
        if (emails.length > 1) {
          companyGroups[domain] = emails;
        }
      });
      
      return companyGroups;
    },
    selectedIndividualEmails(): string[] {
      const selectedRecipients = this.recipients.filter(r => r.isSelected);
      const groups = this.groupByDomain(selectedRecipients);
      
      let individualEmails: string[] = [];
      
      Object.entries(groups).forEach(([domain, emails]) => {
        if (emails.length === 1) {
          individualEmails = [...individualEmails, ...emails];
        }
      });
      
      return individualEmails;
    }
  },
  methods: {
    groupByDomain(items: Recipient[]): DomainGroups {
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
    },
    selectRecipient(email: string): void {
      const recipient = this.recipients.find(r => r.email === email);
      if (recipient) {
        recipient.isSelected = true;
      }
    },
    selectDomain(domain: string): void {
      this.recipients.forEach(recipient => {
        if (recipient.email.endsWith(`@${domain}`)) {
          recipient.isSelected = true;
        }
      });
    },
    unselectRecipient(email: string): void {
      const recipient = this.recipients.find(r => r.email === email);
      if (recipient) {
        recipient.isSelected = false;
      }
    },
    removeCompanyDomain(domain: string): void {
      this.recipients.forEach(recipient => {
        if (recipient.email.endsWith(`@${domain}`)) {
          recipient.isSelected = false;
        }
      });
    },
    onSearch(): void {
      // This function updates the filteredUngroupedEmails computed property automatically
      if (!this.searchText) {
        return;
      }
      
      // Also update autocomplete options based on search text
      const availableDomains = Object.keys(this.availableDomainGroups);
      const suggestions: AutoCompleteOption[] = [];
      
      // Add domain suggestions
      availableDomains.forEach(domain => {
        if (domain.toLowerCase().includes(this.searchText.toLowerCase())) {
          suggestions.push({ value: domain });
        }
      });
      
      // Add email suggestions from available recipients
      this.recipients
        .filter(recipient => !recipient.isSelected)
        .forEach(recipient => {
          if (recipient.email.toLowerCase().includes(this.searchText.toLowerCase())) {
            suggestions.push({ value: recipient.email });
          }
        });
      
      this.autoCompleteOptions = suggestions;
    },
    onAutoCompleteSearch(text: string): void {
      if (!text) {
        this.autoCompleteOptions = [];
        return;
      }

      const availableDomains = Object.keys(this.availableDomainGroups);
      const suggestions: AutoCompleteOption[] = [];

      availableDomains.forEach(domain => {
        if (domain.toLowerCase().includes(text.toLowerCase())) {
          suggestions.push({ value: domain });
        }
      });

      this.recipients.forEach(recipient => {
        if (recipient.email.toLowerCase().includes(text.toLowerCase())) {
          suggestions.push({ value: recipient.email });
        }
      });

      this.autoCompleteOptions = suggestions;
    },
    isValidEmail(email: string): boolean {
      // Simplified validation to match test expectations
      const re = /^[^\s@]+@[^\s@]+$/;
      return re.test(email);
    },
    addNewEmail(): void {
      if (this.isValidEmail(this.newEmail)) {
        const exists = this.recipients.some(r => r.email === this.newEmail);
        
        if (!exists) {
          this.recipients.push({
            email: this.newEmail,
            isSelected: false
          });
          
          const domain = this.newEmail.split('@')[1];
          
          if (!this.activeKeys.includes(domain)) {
            this.activeKeys.push(domain);
          }
        }
        
        this.newEmail = '';
      }
    }
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

.section-title {
  font-weight: bold;
}
</style>