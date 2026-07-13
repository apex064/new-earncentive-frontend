import type React from "react";
import { useCallback, useMemo, useState } from "react";
import FormOTP from "@/components/auth/otp-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PlanName } from "@/constants/pricing";

export type FormTabs = "form-details" | "form-otp";

type OnHandleTabSwitch = (value: FormTabs) => void;

export type FormComponentType<Props extends object> = React.ComponentType<
  Props & {
    onHandleTabSwitch: OnHandleTabSwitch;
    plan?: PlanName;
    useOneTap?: boolean;
  }
>;

export type AuthFormTabsProps<FormProps extends object> = {
  FormComponent: FormComponentType<FormProps>;
  OTPComponent?: React.ComponentType;
  initialTab?: FormTabs;
  value?: FormTabs;
  onChange?: (value: FormTabs) => void;
  tabsListClassName?: string;
  className?: string;
  formProps?: FormProps;
};

export default function AuthFormTabs<FormProps extends object>({
  FormComponent,
  OTPComponent,
  initialTab = "form-details",
  value,
  onChange,
  tabsListClassName = "hidden",
  className,
  formProps,
}: AuthFormTabsProps<FormProps>) {
  const [internalTab, setInternalTab] = useState<FormTabs>(initialTab);

  const isControlled = typeof value !== "undefined";
  const activeTab = (isControlled ? value! : internalTab) as FormTabs;

  const setTab = useCallback(
    (v: FormTabs) => {
      if (isControlled) {
        onChange?.(v);
      } else {
        setInternalTab(v);
      }
    },
    [isControlled, onChange],
  );

  const handleTabSwitch = useCallback(
    (v: FormTabs) => {
      setTab(v);
    },
    [setTab],
  );

  const OTP = useMemo(() => OTPComponent ?? FormOTP, [OTPComponent]);

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={(val) => setTab(val as FormTabs)}>
        <TabsList className={tabsListClassName}>
          <TabsTrigger value="form-details">Form Details</TabsTrigger>
          <TabsTrigger value="form-otp">Form OTP</TabsTrigger>
        </TabsList>

        <TabsContent value="form-details">
          <FormComponent
            {...(formProps as FormProps)}
            onHandleTabSwitch={handleTabSwitch}
          />
        </TabsContent>

        <TabsContent value="form-otp">
          <OTP />
        </TabsContent>
      </Tabs>
    </div>
  );
}
