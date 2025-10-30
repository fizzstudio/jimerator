/* ParaManifest: Testing
Copyright (C) 2025 Fizz Studios

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.*/

import { html, LitElement, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// import { type Manifest } from '../../types/manifest'; May be needed for non-specific
import { ManifestValidator, ValidateOutput } from '../../lib'; // Specific
import { Json } from '@hyperjump/json-pointer';

@customElement('manifest-picker')
export class ManifestPicker extends LitElement {
  @property()
  accessor filename: string = '';

  private manifest?: Json;

  // Specific
  private validator = new ManifestValidator();
  private validationResult?: ValidateOutput;

  async loadManifest() {
    const NODE_PREFIX = './node_modules/@fizz/chart-data/data/';
    const filePath = NODE_PREFIX + this.filename;
    const manifestRaw = await fetch(filePath);
    this.manifest = await manifestRaw.json() as Json; // Specific, otherwise as Manifest;
    this.validationResult = await this.validator.validate(this.manifest);
    this.requestUpdate();
  }

  connectedCallback(): void {
    super.connectedCallback();
    console.log(this.filename)
    if (this.filename) {
      this.loadManifest();
    }
  }

  protected async willUpdate(changedProperties: PropertyValues) {
    console.log('MOCK WILL UPDATE');
    for (const [k, v] of changedProperties.entries()) {
      console.log(`- ${k.toString()}:`, v, '->', this[k]);
    }
    if (changedProperties.has('filename') && this.filename) {
      console.log('LOADING MANIFEST');
      await this.loadManifest();
    }
  }

  render() {
    if (!this.manifest) {
      return html`No manifest selected`;
    }

    // Specific
    if (this.validationResult!.valid) {
      return html`Manifest is valid`;
    }

    // Specific
    return html`${this.validationResult!.errors}`;
  }
  
}

export interface ManifestPickerProps {
  filename: string;
}

/**
 * Function that takes MenuItem properties and returns
 * the markup for a MenuItem.
 */
export const ManifestPickerMaker = ({ filename }: ManifestPickerProps) => {
  return html`
    <manifest-picker
      filename=${filename}
    >
    </manifest-picker>
  `;
};
