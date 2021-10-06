import thothCore from '@latitudegames/thoth-core/dist/server'

const {
  components: {
    moduleInput,
    moduleOutput,
    moduleTriggerIn,
    moduleTriggerOut,
    tenseTransformer,
  },
} = thothCore

export const components = [
  // new ActionTypeComponent(),
  // new Alert(),
  // new BooleanGate(),
  // new Code(),
  // new DifficultyDetectorComponent(),
  // new EnkiTask(),
  // new EntityDetector(),
  // new ForEach(),
  // new Generator(),
  // new InputComponent(),
  // new ItemTypeComponent(),
  // new JoinListComponent(),
  // new ModuleComponent(),
  moduleInput(),
  moduleOutput(),
  moduleTriggerOut(),
  moduleTriggerIn(),
  // new PlaytestPrint(),
  // new PlaytestInput(),
  // new RunInputComponent(),
  // new SafetyVerifier(),
  // new StateWrite(),
  // new StateRead(),
  // new StringProcessor(),
  // new SwitchGate(),
  tenseTransformer(),
  // new TimeDetectorComponent(),
]
