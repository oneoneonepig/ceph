import {
  AbstractControl,
  AbstractControlOptions,
  AsyncValidatorFn,
  FormGroup,
  NgForm,
  ValidatorFn
} from '@angular/forms';

/**
 * CdFormGroup extends FormGroup with a few new methods that will help form development.
 */
export class CdFormGroup extends FormGroup {
  constructor(
    public controls: { [key: string]: AbstractControl },
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super(controls, validatorOrOpts, asyncValidator);
  }

  /**
   * Get a control out of any control even if its nested in other CdFormGroups or a FormGroup
   *
   * @param {string} controlName
   * @returns {AbstractControl}
   */
  get(controlName: string): AbstractControl {
    const control = this._get(controlName);
    if (!control) {
      throw new Error(`Control '${controlName}' could not be found!`);
    }
    return control;
  }

  _get(controlName): AbstractControl {
    return (
      super.get(controlName) ||
      Object.values(this.controls)
        .filter((c) => c.get)
        .map((form) => {
          if (form instanceof CdFormGroup) {
            return form._get(controlName);
          }
          return form.get(controlName);
        })
        .find((c) => Boolean(c))
    );
  }

  /**
   * Get the value of a control if it has none it will return false
   *
   * @param {string} controlName
   * @returns {any} false or the value of the control
   */
  getValue(controlName: string): any {
    const value = this.get(controlName).value;
    return this._filterValue(value) && value;
  }

  // Overwrite this if needed.
  _filterValue(value) {
    return value !== '';
  }

  /**
   * Sets a control without triggering a value changes event
   *
   * Very useful if a function is called through a value changes event but the value
   * should be changed within the call.
   *
   * @param {string} controlName
   * @param value
   */
  silentSet(controlName: string, value: any) {
    this.get(controlName).setValue(value, { emitEvent: false });
  }

  /**
   * Indicates errors of the control in templates
   *
   * @param {string} controlName
   * @param {NgForm} form
   * @param {string} errorName
   * @returns {boolean}
   */
  showError(controlName: string, form: NgForm, errorName?: string) {
    const control = this.get(controlName);
    return (
      (form.submitted || control.dirty) &&
      (errorName ? control.hasError(errorName) : control.invalid)
    );
  }
}